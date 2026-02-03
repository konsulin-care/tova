import { StimulusType } from '../../types/electronAPI';
import { TargetStimulus } from './TargetStimulus';
import { NonTargetStimulus } from './NonTargetStimulus';

interface StimulusContainerProps {
  isVisible: boolean;
  stimulusType: StimulusType | null;
}

export function StimulusContainer({ isVisible, stimulusType }: StimulusContainerProps) {
  return (
    <div className="w-[300px] h-[300px] bg-white relative border-2 border-gray-300 shadow-lg">
      {isVisible && stimulusType === 'target' && <TargetStimulus />}
      {isVisible && stimulusType === 'non-target' && <NonTargetStimulus />}
    </div>
  );
}
