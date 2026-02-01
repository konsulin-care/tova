import React, { useState, useEffect } from 'react';

function App() {
  const [timing, setTiming] = useState<string>('Not measured');
  const [dbResult, setDbResult] = useState<any>(null);

  const measureTiming = async () => {
    try {
      const result = await (window as any).electronAPI.getHighPrecisionTime();
      setTiming(`High precision time: ${result}`);
    } catch (error) {
      setTiming(`Error: ${error}`);
    }
  };

  const testDatabase = async () => {
    try {
      const result = await (window as any).electronAPI.queryDatabase('SELECT 1 as test');
      setDbResult(result);
    } catch (error) {
      setDbResult({ error: String(error) });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>TOVA Clinical Test Platform</h1>
      <div style={{ marginBottom: '20px' }}>
        <h2>Timing Validation</h2>
        <p>{timing}</p>
        <button onClick={measureTiming}>Measure Timing</button>
      </div>
      <div>
        <h2>Database Test</h2>
        <pre>{JSON.stringify(dbResult, null, 2)}</pre>
        <button onClick={testDatabase}>Test Database</button>
      </div>
    </div>
  );
}

export default App;