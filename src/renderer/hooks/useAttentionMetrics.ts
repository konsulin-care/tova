import { useState, useCallback } from 'react';
import { TestEvent } from '../types/electronAPI';
import { SubjectInfo, AttentionMetrics } from '../types/trial';
import { calculateAttentionMetrics } from '../utils/trial-metrics';

export function useAttentionMetrics(testEvents: TestEvent[]) {
  const [metrics, setMetrics] = useState<AttentionMetrics | null>(null);

  const calculateMetrics = useCallback((subjectInfo: SubjectInfo) => {
    if (testEvents.length > 0) {
      const result = calculateAttentionMetrics(testEvents, subjectInfo);
      setMetrics(result);
      return result;
    }
    return null;
  }, [testEvents]);

  return { metrics, calculateMetrics, setMetrics };
}
