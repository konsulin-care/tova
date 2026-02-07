import { useTranslation } from 'react-i18next';

interface CountdownDisplayProps {
  countdown: number;
}

export function CountdownDisplay({ countdown }: CountdownDisplayProps) {
  const { t } = useTranslation('translation');
  
  return (
    <div className="text-white text-3xl mb-8 font-mono">
      <div>{t('test.countdown.title')}</div>
      <div className="text-2xl">{t('test.countdown.description')}</div>
      <div className="text-4xl mt-4">{countdown}</div>
    </div>
  );
}
