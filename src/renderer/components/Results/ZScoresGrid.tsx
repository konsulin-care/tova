import { AttentionMetrics } from '../../types/trial';

interface ZScoresGridProps {
  metrics: AttentionMetrics;
}

export function ZScoresGrid({ metrics }: ZScoresGridProps) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-4 text-left bg-gray-800 p-4 rounded-lg">
      <div>
        <div className="text-gray-400 text-sm">RT Z-Score</div>
        <div className="text-xl">{metrics.zScores.responseTime.toFixed(2)}</div>
      </div>
      <div>
        <div className="text-gray-400 text-sm">D' Z-Score</div>
        <div className="text-xl">{metrics.zScores.dPrime.toFixed(2)}</div>
      </div>
      <div>
        <div className="text-gray-400 text-sm">Variability Z</div>
        <div className="text-xl">{metrics.zScores.variability.toFixed(2)}</div>
      </div>
    </div>
  );
}
