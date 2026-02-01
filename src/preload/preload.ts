import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Timing API
  getHighPrecisionTime: () => ipcRenderer.invoke('get-high-precision-time'),
  
  // Database API
  queryDatabase: (sql: string, params?: any[]) => 
    ipcRenderer.invoke('query-database', sql, params),
});