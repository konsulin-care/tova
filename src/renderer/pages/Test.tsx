export default function Test() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">
        Test in Progress
      </h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <p className="text-yellow-700 text-lg">
          The T.O.V.A. test will appear here. This placeholder will be replaced
          with the actual test implementation featuring:
        </p>
        <ul className="list-disc list-inside mt-4 text-yellow-700 space-y-2">
          <li>High-precision stimulus presentation (±1ms)</li>
          <li>Alternating target and non-target stimuli</li>
          <li>Real-time response capture</li>
          <li>21.6-minute test duration</li>
        </ul>
      </div>
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Test Protocol</h2>
        <p className="text-gray-600">
          During the actual test, you will see a sequence of visual stimuli.
          Press the button or key when the target stimulus appears (typically the
          square that is different from the others). Do not respond to non-target
          stimuli. The test will run for approximately 21.6 minutes.
        </p>
      </div>
    </div>
  );
}
