import { useState, useEffect, useCallback } from 'react';
import { TestPhase } from './useTestPhase';

interface UseTestInputReturn {
  hasResponded: boolean;
  recordResponse: (response: boolean) => Promise<void>;
  resetResponse: () => void;
}

export function useTestInput(phase: TestPhase): UseTestInputReturn {
  const [hasResponded, setHasResponded] = useState(false);

  const recordResponse = useCallback(async (response: boolean) => {
    try {
      await window.electronAPI.recordResponse(response);
      setHasResponded(true);
    } catch (error) {
      console.error('Failed to record response:', error);
    }
  }, []);

  const resetResponse = useCallback(() => {
    setHasResponded(false);
  }, []);

  useEffect(() => {
    if (phase !== 'running') {
      setHasResponded(false);
    }
  }, [phase]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (phase !== 'running') return;
      if (hasResponded) return;
      if (event.button === 0) {
        recordResponse(true);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (phase !== 'running') return;
      if (hasResponded) return;
      if (event.code === 'Space') {
        event.preventDefault();
        recordResponse(true);
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, hasResponded, recordResponse]);

  return { hasResponded, recordResponse, resetResponse };
}
