import { useNavigation } from '../store';

export default function Settings() {
  const { setPage } = useNavigation();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Settings
      </h1>

      <div className="space-y-6">
        {/* Timing Calibration */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Timing Calibration
          </h2>
          <p className="text-gray-600 mb-4">
            Configure timing precision and display settings for accurate test results.
          </p>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              Run Timing Validation
            </button>
            <button className="w-full text-left px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              Display Refresh Rate: Auto-detect
            </button>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Audio Settings
          </h2>
          <p className="text-gray-600 mb-4">
            Configure audio feedback during the test (optional).
          </p>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              Audio Feedback: Off
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Data Management
          </h2>
          <p className="text-gray-600 mb-4">
            Manage local test data and upload settings.
          </p>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              Pending Uploads: 0
            </button>
            <button className="w-full text-left px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              Clear Local Cache
            </button>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => setPage('home')}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
