interface TrialProgressProps {
  currentTrial: number;
  totalTrials: number;
}

export function TrialProgress({ currentTrial, totalTrials }: TrialProgressProps) {
  return (
    <div className="text-gray-800 text-xl mb-4 font-mono">
      Trial {currentTrial} / {totalTrials}
    </div>
  );
}
