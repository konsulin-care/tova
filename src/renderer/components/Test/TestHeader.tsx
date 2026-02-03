import { useNavigation } from '../../store';
import { TestPhase } from '../../hooks/useTestPhase';

interface TestHeaderProps {
  phase: TestPhase;
  onStopTest: () => void;
}

export function TestHeader({ phase, onStopTest }: TestHeaderProps) {
  const { endTest } = useNavigation();

  return (
    <>
      {/* Exit Test button */}
      <button
        onClick={endTest}
        className="absolute top-4 left-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
      >
        ← Exit Test
      </button>

      {/* Stop Test button (when running) */}
      {phase === 'running' && (
        <button
          onClick={onStopTest}
          className="absolute top-4 right-4 px-4 py-2 bg-red-200 hover:bg-red-300 text-red-800 rounded-lg font-medium transition-colors"
        >
          Stop Test
        </button>
      )}
    </>
  );
}
