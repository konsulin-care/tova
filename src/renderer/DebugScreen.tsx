import React, { useState, useEffect } from 'react';

// TypeScript interface for the electronAPI
interface ElectronAPI {
  getEventTimestamp: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

function DebugScreen() {
  const [timestamp, setTimestamp] = useState<string>('No event detected');
  const [eventType, setEventType] = useState<string>('');

  useEffect(() => {
    // Handle mouse click events
    const handleClick = async (event: MouseEvent) => {
      if (event.button === 0) {
        // Left click
        try {
          const timestampNs = await window.electronAPI.getEventTimestamp();
          const timestampMs = Number(timestampNs) / 1_000_000;
          setTimestamp(`${timestampMs.toFixed(3)} ms`);
          setEventType('Click');
        } catch (error) {
          setTimestamp(`Error: ${error}`);
          setEventType('Click');
        }
      }
    };

    // Handle keyboard events
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault(); // Prevent scrolling
        try {
          const timestampNs = await window.electronAPI.getEventTimestamp();
          const timestampMs = Number(timestampNs) / 1_000_000;
          setTimestamp(`${timestampMs.toFixed(3)} ms`);
          setEventType('Space');
        } catch (error) {
          setTimestamp(`Error: ${error}`);
          setEventType('Space');
        }
      }
    };

    // Attach event listeners to window
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="bg-black h-screen flex justify-center items-center">
      <div className="w-[300px] h-[300px] bg-white relative">
        <div className="absolute top-1 left-1 text-black font-mono text-sm">
          {eventType && <div>{eventType}: </div>}
          {timestamp}
        </div>
      </div>
    </div>
  );
}

export default DebugScreen;
