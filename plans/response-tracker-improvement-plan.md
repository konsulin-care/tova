# Response Tracker Improvement Plan

## Issue Summary
The `processResponse` method in `response-tracker.ts` incorrectly validates responses using only `interstimulusIntervalMs` instead of the full response window (`stimulusDurationMs + interstimulusIntervalMs`). This can cause valid responses during long stimuli to be flagged as commission errors.

## Current Code Problem (Line 110-114)
```typescript
// Find valid pending response within ISI window
const pendingIndex = this.pendingResponses.findIndex(pr => {
  const elapsedMs = Number(responseTimestampNs - pr.onsetTimestampNs) / 1_000_000;
  return elapsedMs < this.config.interstimulusIntervalMs;  // BUG: Only checks ISI
});
```

## Proposed Fix

### Change 1: Update Response Validation Logic
**File:** `src/main/response-tracker.ts`
**Lines:** 110-114

Replace:
```typescript
// Find valid pending response within ISI window
const pendingIndex = this.pendingResponses.findIndex(pr => {
  const elapsedMs = Number(responseTimestampNs - pr.onsetTimestampNs) / 1_000_000;
  return elapsedMs < this.config.interstimulusIntervalMs;
});
```

With:
```typescript
// Find valid pending response within the full response window
// The window includes stimulus duration + interstimulus interval
const responseWindowMs = this.config.stimulusDurationMs + this.config.interstimulusIntervalMs;
const pendingIndex = this.pendingResponses.findIndex(pr => {
  const elapsedMs = Number(responseTimestampNs - pr.onsetTimestampNs) / 1_000_000;
  return elapsedMs < responseWindowMs;
});
```

### Change 2: Update Class Documentation
**File:** `src/main/response-tracker.ts`
**Lines:** 23-32

Update the class docstring to clarify response window:
```typescript
/**
 * ResponseTracker manages response validation during test execution.
 * 
 * Responsibilities:
 * - Track pending responses for current stimulus window
 * - Validate responses against stimulus onset timing
 * - Detect anticipatory responses (< threshold)
 * - Detect commission errors (responses outside valid window)
 *   Valid window = stimulusDurationMs + interstimulusIntervalMs
 * - Track response counts per trial (multiple responses)
 */
```

## Implementation Notes

### Timing Semantics
- `stimulusDurationMs`: How long the stimulus is visible
- `interstimulusIntervalMs`: Gap between stimulus offset and next stimulus onset
- **Full response window**: Time from stimulus onset until the next trial's stimulus begins (stimulus visible + gap)

### Why This Fix Works
1. **Default config** (100ms stimulus + 2000ms ISI = 2100ms window) continues to work
2. **Long stimulus configs** (e.g., 3000ms stimulus + 1000ms ISI = 4000ms window) now correctly allow responses throughout the extended stimulus
3. **Abbreviated tests** with shorter durations work correctly

## Testing Considerations
1. Verify default config still works correctly
2. Test with extended stimulus duration (> ISI)
3. Test with very short stimulus duration (< anticipatory threshold)
4. Verify commission errors only trigger after the full response window

## Files to Modify
- `src/main/response-tracker.ts` - Fix validation logic and comments

## Related Documentation
- Update `context.md` in memory bank to reflect this bug fix
