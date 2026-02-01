import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import Database from 'better-sqlite3';

/**
 * Computes the integer square root of a BigInt using binary search.
 * @param n - The number to compute the square root of
 * @returns The integer square root of n
 */
function bigIntSqrt(n: bigint): bigint {
  if (n < 0n) {
    throw new Error('Cannot compute square root of negative number');
  }
  
  if (n === 0n || n === 1n) {
    return n;
  }
  
  let low = 1n;
  let high = n;
  let result = 0n;
  
  while (low <= high) {
    const mid = (low + high) / 2n;
    const midSquared = mid * mid;
    
    if (midSquared === n) {
      return mid;
    } else if (midSquared < n) {
      low = mid + 1n;
      result = mid;
    } else {
      high = mid - 1n;
    }
  }
  
  return result;
}

/**
 * Validates the timing precision of the system using process.hrtime.bigint().
 * Measures 1000 iterations of timestamp capture and calculates mean and standard deviation.
 * 
 * @returns boolean indicating whether timing precision meets clinical requirements
 *          (standard deviation < 0.001 milliseconds)
 */
function validateTimingPrecision(): boolean {
  const iterations = 1000;
  const measurements: bigint[] = [];

  // Capture timing measurements - time between consecutive calls to process.hrtime.bigint()
  let previousTimestamp = process.hrtime.bigint();

  for (let i = 0; i < iterations; i++) {
    const currentTimestamp = process.hrtime.bigint();
    const delta = currentTimestamp - previousTimestamp;
    measurements.push(delta);
    previousTimestamp = currentTimestamp;
  }

  // Calculate mean (average) of measurements
  let sum = 0n;
  for (const measurement of measurements) {
    sum += measurement;
  }
  const meanNs = sum / BigInt(iterations);
  const meanMs = Number(meanNs) / 1000000;

  // Calculate standard deviation
  let sumOfSquares = 0n;
  for (const measurement of measurements) {
    const difference = measurement - meanNs;
    sumOfSquares += difference * difference;
  }
  const varianceNs = sumOfSquares / BigInt(iterations);
  const stdDevNs = bigIntSqrt(varianceNs);
  const stdDevMs = Number(stdDevNs) / 1000000;

  console.log('========================================');
  console.log('Timing Validation Results:');
  console.log('  Iterations: ' + iterations);
  console.log('  Mean: ' + meanMs.toFixed(6) + ' ms');
  console.log('  Standard Deviation: ' + stdDevMs.toFixed(6) + ' ms');
  console.log('  Clinical Requirement: standard deviation < 0.001 milliseconds (1 microsecond)');

  const passes = stdDevMs < 0.001;

  if (passes) {
    console.log('✅ Timing validation PASSED');
    console.log('  Hardware meets clinical precision requirements');
    console.log('  Standard deviation < 0.001 ms (1 microsecond)');
    console.log('========================================\n');
  } else {
    console.error('❌ Timing validation FAILED');
    console.error('  Hardware does NOT meet clinical precision requirements');
    console.error('  Required: Standard deviation < 0.001 ms (1 microsecond)');
    console.error('  Actual: Standard deviation = ' + stdDevMs.toFixed(6) + ' ms');
    console.error('========================================\n');
  }

  return passes;
}

// Run timing validation before any other initialization
console.log('Starting timing validation...');
const timingValidationPassed = validateTimingPrecision();

if (!timingValidationPassed) {
  console.warn('⚠️  WARNING: Hardware does not meet clinical timing precision requirements');
  console.warn('⚠️  Standard deviation exceeds 0.001 ms threshold');
  console.warn('⚠️  This hardware may be unsuitable for clinical use');
  console.warn('⚠️  Application will continue but timing accuracy may be compromised');
  console.warn('⚠️  Consider running on hardware with better timing precision for clinical deployments\n');
}

// Initialize SQLite database
let db: Database.Database | null = null;

function initDatabase() {
  try {
    db = new Database(path.join(app.getPath('userData'), 'tova.db'));
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Create main window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

// App lifecycle
app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) {
      db.close();
    }
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('get-high-precision-time', async () => {
  return process.hrtime.bigint().toString();
});

ipcMain.handle('query-database', async (_event, sql: string, params?: any[]) => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  try {
    const stmt = db.prepare(sql);
    const result = stmt.all(...(params || []));
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
});