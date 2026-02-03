import { AttentionMetrics } from '../../types/trial';
import { normalCDF } from '../../utils/statistics';

interface AcsScoreCardProps {
  metrics: AttentionMetrics;
}

export function AcsScoreCard({ metrics }: AcsScoreCardProps) {
  return (
    <div className="mb-6 bg-blue-900/50 p-6 rounded-lg border border-blue-700">
      <div className="text-blue-300 text-sm mb-1">Attention Comparison Score (ACS)</div>
      <div className="text-5xl font-bold text-white">{metrics.acs.toFixed(2)}</div>
      <div className={`mt-2 text-lg font-medium ${
        metrics.acsInterpretation === 'normal' ? 'text-green-400' :
        metrics.acsInterpretation === 'borderline' ? 'text-yellow-400' :
        'text-red-400'
      }`}>
        {metrics.acsInterpretation === 'normal' ? '✓ Within Normal Limits' :
         metrics.acsInterpretation === 'borderline' ? '~ Borderline' :
         '✗ Not Within Normal Limits'}
      </div>
      <div className="text-blue-300 text-sm mt-2">
        F.O.C.U.S. Score: {normalCDF(metrics.acs - 1.80).toFixed(1)}%
      </div>
    </div>
  );
}
