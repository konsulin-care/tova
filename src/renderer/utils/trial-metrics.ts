/**
 * F.O.C.U.S. Clinical Attention Test - Trial Metrics Utilities
 * 
 * Utility functions for processing raw test events into trial results
 * and computing comprehensive test metrics.
 */

import { TestEvent, TestConfig } from '../types/electronAPI';
import { TrialResult, TestMetrics, TrialOutcome, SubjectInfo, AttentionMetrics } from '../types/trial';
import { getNormativeStats } from './normative-data';
import { zScore, clampProbability, inverseNormalCDF, calculateStdDev, calculateMean } from './statistics';

/**
 * Threshold in milliseconds for anticipatory responses.
 */
const ANTICIPATORY_THRESHOLD_MS = 150;

/**
 * Maximum valid anticipatory response percentage.
 */
const MAX_ANTICIPATORY_PERCENT = 20;

/**
 * Full test trial count (21.6 minute test).
 * Used for proportional Z-score adjustment.
 */
const FULL_TEST_TRIALS = 648;

/**
 * Calculate response time in milliseconds from onset to response.
 * 
 * @param onsetTimestampNs - Stimulus onset timestamp in nanoseconds
 * @param responseTimestampNs - Response timestamp in nanoseconds
 * @returns Response time in milliseconds
 */
export function calculateResponseTime(
  onsetTimestampNs: bigint,
  responseTimestampNs: bigint
): number {
  const diffNs = responseTimestampNs - onsetTimestampNs;
  return Number(diffNs) / 1_000_000;
}

/**
 * Check if response is anticipatory (within 150ms of stimulus onset).
 * 
 * @param responseTimeMs - Response time in milliseconds
 * @returns True if response is anticipatory
 */
export function isAnticipatory(responseTimeMs: number): boolean {
  return responseTimeMs < ANTICIPATORY_THRESHOLD_MS;
}

/**
 * Determine trial outcome from stimulus type and response correctness.
 * 
 * @param stimulusType - Type of stimulus presented
 * @param responseCorrect - Whether the response was correct
 * @param hadResponse - Whether a response was recorded
 * @returns Trial outcome
 */
export function determineTrialOutcome(
  stimulusType: 'target' | 'non-target',
  responseCorrect: boolean,
  hadResponse: boolean
): TrialOutcome {
  if (stimulusType === 'target') {
    if (hadResponse && responseCorrect) {
      return 'hit';
    } else if (!hadResponse) {
      return 'omission';
    } else {
      // Response to target but incorrect (shouldn't happen with current logic)
      return 'omission';
    }
  } else {
    // Non-target stimulus
    if (!hadResponse) {
      return 'correct-rejection';
    } else if (!responseCorrect) {
      return 'commission';
    } else {
      // Response to non-target but marked correct (shouldn't happen)
      return 'commission';
    }
  }
}

/**
 * Process raw test events into an array of trial results.
 * 
 * @param events - Array of raw test events
 * @param config - Test configuration
 * @returns Array of processed trial results
 */
export function processTestEvents(
  events: TestEvent[],
  config: TestConfig
): TrialResult[] {
  const trialResults: TrialResult[] = [];
  
  // Group events by trial and find onset/response pairs
  const trialOnsets: Map<number, TestEvent> = new Map();
  const trialResponses: Map<number, TestEvent[]> = new Map();
  
  // First pass: collect onsets and responses per trial
  for (const event of events) {
    if (event.eventType === 'stimulus-onset') {
      trialOnsets.set(event.trialIndex, event);
      trialResponses.set(event.trialIndex, []);
    } else if (event.eventType === 'response') {
      const responses = trialResponses.get(event.trialIndex);
      if (responses) {
        responses.push(event);
      }
    }
  }
  
  // Process each trial
  for (let i = 0; i < config.totalTrials; i++) {
    const onset = trialOnsets.get(i);
    const responses = trialResponses.get(i) || [];
    
    if (!onset) {
      // No onset event for this trial - should not happen
      continue;
    }
    
    const firstResponse = responses[0];
    const responseCount = responses.length;
    
    let responseTimeMs: number | null = null;
    let isAnticipatoryFlag = false;
    let responseCorrect = false;
    let hadResponse = false;
    
    if (firstResponse) {
      hadResponse = true;
      responseCorrect = firstResponse.responseCorrect ?? false;
      responseTimeMs = firstResponse.responseTimeMs ?? null;
      isAnticipatoryFlag = firstResponse.isAnticipatory ?? false;
    }
    
    const outcome = determineTrialOutcome(
      onset.stimulusType,
      responseCorrect,
      hadResponse
    );
    
    trialResults.push({
      trialIndex: i,
      stimulusType: onset.stimulusType,
      outcome,
      responseTimeMs,
      isAnticipatory: isAnticipatoryFlag,
      isMultipleResponse: responseCount > 1,
      followsCommission: false, // Will be set in second pass
    });
  }
  
  // Second pass: mark trials following commission errors
  for (let i = 1; i < trialResults.length; i++) {
    if (trialResults[i - 1].outcome === 'commission') {
      trialResults[i] = {
        ...trialResults[i],
        followsCommission: true,
        postCommissionResponseTimeMs: trialResults[i].responseTimeMs ?? undefined,
      };
    }
  }
  
  return trialResults;
}

/**
 * Calculate standard deviation of an array of numbers.
 * 
 * @param values - Array of numbers
 * @param mean - Mean value
 * @returns Standard deviation
 */
function calculateStdDevWithMean(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate comprehensive test metrics from trial results.
 * 
 * @param trials - Array of trial results
 * @returns Computed test metrics
 */
export function calculateTestMetrics(trials: TrialResult[]): TestMetrics {
  // Count outcomes
  const hits = trials.filter(t => t.outcome === 'hit').length;
  const omissions = trials.filter(t => t.outcome === 'omission').length;
  const commissions = trials.filter(t => t.outcome === 'commission').length;
  const correctRejections = trials.filter(t => t.outcome === 'correct-rejection').length;
  
  // Collect response times for valid responses (hits only)
  const responseTimes = trials
    .filter(t => t.responseTimeMs !== null && t.responseTimeMs !== undefined)
    .map(t => t.responseTimeMs as number);
  
  // Calculate response time statistics
  const meanResponseTimeMs = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;
  const stdResponseTimeMs = calculateStdDevWithMean(responseTimes, meanResponseTimeMs);
  
  // Validity indices
  const anticipatoryResponses = trials.filter(t => t.isAnticipatory).length;
  const multipleResponses = trials.filter(t => t.isMultipleResponse).length;
  const postCommissionTrials = trials.filter(t => t.followsCommission).length;
  
  // Calculate F.O.C.U.S. composite scores (0-100 scale)
  
  // Attention Score: Based on response time consistency (lower variability = higher score)
  // Using inverse of coefficient of variation
  const cv = meanResponseTimeMs > 0 ? stdResponseTimeMs / meanResponseTimeMs : 0;
  const attentionScore = Math.max(0, Math.min(100, 100 * (1 - cv)));
  
  // Impulse Control Score: Based on commission error rate
  const totalNonTargets = trials.filter(t => t.stimulusType === 'non-target').length;
  const commissionRate = totalNonTargets > 0 ? commissions / totalNonTargets : 0;
  const impulseControlScore = Math.max(0, Math.min(100, 100 * (1 - commissionRate)));
  
  // Consistency Score: Combination of attention and impulse control
  const consistencyScore = (attentionScore * 0.6 + impulseControlScore * 0.4);
  
  return {
    trials,
    totalTrials: trials.length,
    hits,
    omissions,
    commissions,
    correctRejections,
    meanResponseTimeMs,
    stdResponseTimeMs,
    anticipatoryResponses,
    multipleResponses,
    postCommissionTrials,
    attentionScore,
    impulseControlScore,
    consistencyScore,
  };
}

/**
 * Calculate D Prime (signal detection sensitivity measure).
 * Uses T.O.V.A. formula: D' = zFA - zHit
 * 
 * @param hitRate - Proportion of hits (0-1, clamped)
 * @param falseAlarmRate - Proportion of false alarms (0-1, clamped)
 * @returns D Prime value (higher = better perceptual sensitivity)
 */
export function calculateDPrime(hitRate: number, falseAlarmRate: number): number {
  const clampedHitRate = clampProbability(hitRate);
  const clampedFARate = clampProbability(falseAlarmRate);
  
  const zHit = inverseNormalCDF(clampedHitRate);
  const zFA = inverseNormalCDF(clampedFARate);
  
  // T.O.V.A. formula: D' = zFA - zHit
  return zFA - zHit;
}

/**
 * Calculate response time variability (variance of response times).
 * 
 * @param responseTimes - Array of response times in milliseconds
 * @param meanRT - Mean response time
 * @returns Variability (sum of squared differences / count)
 */
export function calculateVariability(responseTimes: number[], meanRT: number): number {
  if (responseTimes.length === 0) return 0;
  
  const squaredDiffs = responseTimes.map(rt => Math.pow(rt - meanRT, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / responseTimes.length;
}

/**
 * Calculate comprehensive attention metrics with ACS scoring.
 * 
 * @param events - Array of raw test events
 * @param subjectInfo - Subject demographic information
 * @returns Comprehensive attention metrics
 */
export function calculateAttentionMetrics(
  events: TestEvent[],
  subjectInfo: SubjectInfo
): AttentionMetrics {
  // Process events into trials
  // Note: Using minimal config for event processing
  const minimalConfig = { totalTrials: events.filter(e => e.eventType === 'stimulus-onset').length };
  const trials = processTestEvents(events, minimalConfig as TestConfig);
  
  // Count outcomes
  const hits = trials.filter(t => t.outcome === 'hit').length;
  const omissions = trials.filter(t => t.outcome === 'omission').length;
  const commissions = trials.filter(t => t.outcome === 'commission').length;
  const correctRejections = trials.filter(t => t.outcome === 'correct-rejection').length;
  const anticipatoryResponses = trials.filter(t => t.isAnticipatory).length;
  
  // Calculate totals
  const totalTargets = hits + omissions;
  const totalNonTargets = commissions + correctRejections;
  const validTargets = totalTargets - anticipatoryResponses;
  
  // Calculate percentages
  const omissionPercent = totalTargets > 0 ? (omissions / totalTargets) * 100 : 0;
  const commissionPercent = totalNonTargets > 0 ? (commissions / totalNonTargets) * 100 : 0;
  
  // Collect response times for hits
  const hitResponseTimes = trials
    .filter(t => t.outcome === 'hit' && t.responseTimeMs !== null && !t.isAnticipatory)
    .map(t => t.responseTimeMs as number);
  
  const meanResponseTimeMs = hitResponseTimes.length > 0
    ? calculateMean(hitResponseTimes)
    : 0;
  
  // Calculate variability
  const variability = calculateVariability(hitResponseTimes, meanResponseTimeMs);
  
  // Split trials for ACS calculation
  const midpoint = Math.floor(trials.length / 2);
  const firstHalfTrials = trials.slice(0, midpoint);
  const secondHalfTrials = trials.slice(midpoint);
  const totalTrials = trials;
  
  // First half: Response Time Z
  const firstHalfHits = firstHalfTrials.filter(t => t.outcome === 'hit' && !t.isAnticipatory);
  const firstHalfResponseTimes = firstHalfHits.map(t => t.responseTimeMs as number);
  const firstHalfMeanRT = firstHalfResponseTimes.length > 0
    ? calculateMean(firstHalfResponseTimes)
    : meanResponseTimeMs;
  const firstHalfSD = calculateStdDev(firstHalfResponseTimes);
  
  // Second half: D' Z
  const secondHalfHits = secondHalfTrials.filter(t => t.outcome === 'hit').length;
  const secondHalfOmissions = secondHalfTrials.filter(t => t.outcome === 'omission').length;
  const secondHalfCommissions = secondHalfTrials.filter(t => t.outcome === 'commission').length;
  const secondHalfCorrectRejections = secondHalfTrials.filter(t => t.outcome === 'correct-rejection').length;
  
  const secondHalfTargets = secondHalfHits + secondHalfOmissions;
  const secondHalfNonTargets = secondHalfCommissions + secondHalfCorrectRejections;
  
  const hitRate = secondHalfTargets > 0 ? secondHalfHits / secondHalfTargets : 0.5;
  const falseAlarmRate = secondHalfNonTargets > 0 ? secondHalfCommissions / secondHalfNonTargets : 0.5;
  const dPrime = calculateDPrime(hitRate, falseAlarmRate);
  
  // Total: Variability Z
  const hitResponseTimesAll = totalTrials
    .filter(t => t.outcome === 'hit' && !t.isAnticipatory)
    .map(t => t.responseTimeMs as number);
  const overallMeanRT = hitResponseTimesAll.length > 0
    ? calculateMean(hitResponseTimesAll)
    : meanResponseTimeMs;
  const overallVariability = calculateVariability(hitResponseTimesAll, overallMeanRT);
  
  // Get normative data
  const normativeStats = getNormativeStats(subjectInfo.age, subjectInfo.gender);
  
  // Calculate proportional scaling factor based on trial count
  // For n trials, use SD * sqrt(n/648) to scale Z-scores proportionally
  const trialCount = trials.length;
  const scalingFactor = Math.sqrt(trialCount / FULL_TEST_TRIALS);
  
  // Calculate Z-scores
  let rtZ = 0;
  let dPrimeZ = 0;
  let variabilityZ = 0;
  
  if (normativeStats) {
    // Response Time Z (first half) - note: higher RT is worse, so we negate
    // Apply proportional scaling
    rtZ = -zScore(firstHalfMeanRT, normativeStats.responseTimeMean, normativeStats.responseTimeSD) * scalingFactor;
    
    // D' Z (second half) - higher is better
    dPrimeZ = zScore(dPrime, normativeStats.dPrimeMean, normativeStats.dPrimeSD) * scalingFactor;
    
    // Variability Z (total) - higher variability is worse, so we negate
    variabilityZ = -zScore(overallVariability, normativeStats.variabilityMean, normativeStats.variabilitySD) * scalingFactor;
  }
  
  // Calculate ACS: scaled Z-scores + constant
  // The constant (1.80) is adjusted proportionally: 1.80 * scalingFactor
  const acs = (rtZ + dPrimeZ + variabilityZ) * scalingFactor + (1.80 * scalingFactor);
  
  // Interpret ACS
  let acsInterpretation: 'normal' | 'borderline' | 'not-within-normal-limits';
  if (acs >= 2 * scalingFactor) {
    acsInterpretation = 'normal';
  } else if (acs >= 1.5 * scalingFactor) {
    acsInterpretation = 'borderline';
  } else {
    acsInterpretation = 'not-within-normal-limits';
  }
  
  // Validity assessment - proportional to trial count
  const anticipatoryPercent = totalTargets > 0 ? (anticipatoryResponses / totalTargets) * 100 : 0;
  const minValidResponses = Math.max(5, Math.floor(10 * scalingFactor));
  let validity: AttentionMetrics['validity'];
  
  if (anticipatoryPercent > MAX_ANTICIPATORY_PERCENT) {
    validity = {
      anticipatoryResponses,
      valid: false,
      exclusionReason: `High anticipatory response rate (${anticipatoryPercent.toFixed(1)}% of targets)`,
    };
  } else if (hitResponseTimes.length < minValidResponses) {
    validity = {
      anticipatoryResponses,
      valid: false,
      exclusionReason: `Insufficient valid response data (${hitResponseTimes.length}/${minValidResponses} minimum)`,
    };
  } else {
    validity = {
      anticipatoryResponses,
      valid: true,
    };
  }
  
  return {
    acs,
    acsInterpretation,
    omissionPercent,
    commissionPercent,
    dPrime,
    variability: overallVariability,
    meanResponseTimeMs,
    validity,
    trialCount,
    scalingFactor,
    zScores: {
      responseTime: rtZ,
      dPrime: dPrimeZ,
      variability: variabilityZ,
    },
  };
}
