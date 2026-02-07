import { useTranslation } from '@/i18n';
import { useNavigation } from '@/renderer/store';

export default function Home() {
  const { t } = useTranslation('translation', { keyPrefix: 'home' });
  const { t: buttonT } = useTranslation('translation', { keyPrefix: 'button' });
  const { setPage } = useNavigation();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">
        {t('app.title')}
      </h1>
      <p className="text-gray-600 mb-6 text-lg">
        {t('description')}
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3 text-blue-900">
          {t('duration.title')}
        </h2>
        <p className="text-blue-700">
          {t('duration.text', { duration: 21.6 })}
        </p>
        <p className="text-blue-700 mt-3">
          {t('instructions.text')}
        </p>
      </div>
      <button
        onClick={() => setPage('test')}
        className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-[#099B9E] transition-colors font-semibold text-lg shadow-sm cursor-pointer"
      >
        {buttonT('start')}
      </button>
    </div>
  );
}
