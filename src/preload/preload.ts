import { contextBridge, ipcRenderer } from 'electron';

// Type definitions for the safe database API
type DatabaseQueryCommand = 
  | 'get-pending-uploads'
  | 'get-test-result'
  | 'delete-test-result'
  | 'get-upload-count'
  | 'get-all-test-results'
  | 'insert-test-result'
  | 'update-test-result';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Timing API
  getHighPrecisionTime: () => ipcRenderer.invoke('get-high-precision-time'),
  getEventTimestamp: () => ipcRenderer.invoke('get-event-timestamp'),
  
  // Safe Database API - uses whitelist of predefined queries
  queryDatabase: (command: DatabaseQueryCommand, params?: any[]) => 
    ipcRenderer.invoke('query-database', command, params),
});
