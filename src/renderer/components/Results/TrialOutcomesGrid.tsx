import { AttentionMetrics } from '../../types/trial';

interface TrialOutcomesGridProps {
  metrics: AttentionMetrics;
}

export function TrialOutcomesGrid({ metrics }: TrialOutcomesGridProps) {
  const trialCount = metrics.trialCount;
  const hitCount = Math.round(trialCount * (1 - metrics.omissionPercent / 100) * 0.5);
  const omissionCount = Math.round(trialCount * metrics.omissionPercent / 100 * 0.5);
  const commissionCount = Math.round(trialCount * metrics.commissionPercent / 100 * 0.5);
  const correctRejectionCount = Math.round(trialCount * (1 - metrics.commissionPercent / 100) * 0.5);

  return (
    <div className="grid grid-cols-2 gap-4 text-left bg-gray-800 p-4 rounded-lg">
      <div>
        <div className="text-gray-400 text-sm">Hits</div>
        <div className="text-xl">{hitCount}</div>
      </div>
      <div>
        <div className="text-gray-400 text-sm">Omissions ({metrics.omissionPercent.toFixed(1)}%)</div>
        <div className="text-xl">{omissionCount}</div>
      </div>
      <div>
        <div className="text-gray-400 text-sm">Commissions ({metrics.commissionPercent.toFixed(1)}%)</div>
        <div className="text-xl">{commissionCount}</div>
      </div>
      <div>
        <div className="text-gray-400 text-sm">Correct Rejections</div>
        <div className="text-xl">{correctRejectionCount}</div>
      </div>
    </div>
  );
}
