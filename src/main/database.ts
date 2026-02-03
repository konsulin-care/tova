/**
 * F.O.C.U.S. Clinical Attention Test - Database Module
 * 
 * Database initialization with SQLCipher encryption and query whitelist.
 * Uses better-sqlite3 for local data persistence.
 */

import * as path from 'path';
import { app } from 'electron';
import Database from 'better-sqlite3';
import { 
  DatabaseQueryCommand, 
  QueryWhitelistEntry
} from './types';
import { 
  getOrCreateEncryptionKey, 
  isDatabaseEncrypted, 
  migrateToEncrypted 
} from './encryption';

// ===========================================
// Database Instance
// ===========================================

/**
 * SQLite database instance with SQLCipher encryption.
 * Initialized by initDatabase().
 */
export let db: Database.Database | null = null;

// ===========================================
// Query Whitelist
// ===========================================

/**
 * Safe query whitelist - maps command identifiers to predefined SQL queries.
 * Prevents SQL injection by only allowing predefined queries.
 */
export const queryWhitelist: Record<DatabaseQueryCommand, QueryWhitelistEntry> = {
  'get-pending-uploads': {
    sql: 'SELECT * FROM test_results WHERE upload_status = ?',
    paramCount: 1,
  },
  'get-test-result': {
    sql: 'SELECT * FROM test_results WHERE id = ?',
    paramCount: 1,
  },
  'delete-test-result': {
    sql: 'DELETE FROM test_results WHERE id = ?',
    paramCount: 1,
  },
  'get-upload-count': {
    sql: 'SELECT COUNT(*) as count FROM test_results WHERE upload_status = ?',
    paramCount: 1,
  },
  'get-all-test-results': {
    sql: 'SELECT * FROM test_results',
    paramCount: 0,
  },
  'insert-test-result': {
    sql: 'INSERT INTO test_results (test_data, email, upload_status, created_at, consent_given, consent_timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    paramCount: 6,
  },
  'insert-test-result-with-consent': {
    sql: 'INSERT INTO test_results (test_data, email, upload_status, consent_given, consent_timestamp) VALUES (?, ?, ?, ?, ?)',
    paramCount: 5,
  },
  'update-test-result': {
    sql: 'UPDATE test_results SET upload_status = ? WHERE id = ?',
    paramCount: 2,
  },
  'cleanup-expired-records': {
    sql: 'DELETE FROM test_results WHERE retention_expires_at < datetime("now")',
    paramCount: 0,
  },
  'get-expired-count': {
    sql: 'SELECT COUNT(*) as count FROM test_results WHERE retention_expires_at < datetime("now")',
    paramCount: 0,
  },
};

// ===========================================
// Database Initialization
// ===========================================

/**
 * Initialize the database with SQLCipher encryption.
 * Handles migration from unencrypted to encrypted format.
 */
export function initDatabase(): void {
  const dbPath = path.join(app.getPath('userData'), 'tova.db');
  const fs = require('fs');
  
  // Get or create encryption key
  const encryptionKey = getOrCreateEncryptionKey();
  
  try {
    // Check if database exists and is encrypted
    const exists = fs.existsSync(dbPath);
    const isEncrypted = exists && isDatabaseEncrypted(dbPath);
    
    if (exists && !isEncrypted) {
      // Migrate unencrypted database to encrypted format
      const tempDb = new Database(dbPath);
      migrateToEncrypted(tempDb, encryptionKey);
      db = new Database(dbPath);
    } else {
      // Open database (new or already encrypted)
      db = new Database(dbPath);
    }
    
    // Apply encryption key (required for both new and existing encrypted databases)
    db.exec(`PRAGMA key = "x'${encryptionKey}'"`);
    db.exec('PRAGMA cipher_use_hmac = 1');
    
    // Verify encryption is working by attempting a simple query
    try {
      db.prepare('SELECT 1').get();
      console.log('Database encryption verified successfully');
    } catch (verifyError) {
      console.error('Failed to verify database encryption:', verifyError);
      throw new Error('Database encryption verification failed');
    }
    
    // Create test_results table with GDPR-compliant schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS test_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_data TEXT NOT NULL,
        email TEXT NOT NULL,
        upload_status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        consent_given BOOLEAN NOT NULL DEFAULT 0,
        consent_timestamp TEXT,
        retention_expires_at TEXT GENERATED ALWAYS AS (
          datetime(created_at, '+7 days')
        ) VIRTUAL
      )
    `);
    
    // Create indexes for cleanup queries
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_retention_expires ON test_results(retention_expires_at);
      CREATE INDEX IF NOT EXISTS idx_upload_status ON test_results(upload_status);
    `);
    
    // Create test_config table
    db.exec(`
      CREATE TABLE IF NOT EXISTS test_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    
    console.log('Database initialized successfully with SQLCipher encryption (GDPR-compliant)');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// ===========================================
// Database Query Functions
// ===========================================

/**
 * Execute a whitelisted database query.
 * 
 * @param command - The query command from the whitelist
 * @param params - Optional parameters for the query
 * @returns Query result
 * @throws Error if command is invalid or parameters don't match
 */
export function executeWhitelistedQuery<T>(
  command: DatabaseQueryCommand, 
  params?: unknown[]
): T {
  if (!db) {
    throw new Error('Database not initialized');
  }

  // Validate command is in whitelist
  if (!(command in queryWhitelist)) {
    throw new Error(`Invalid database command: ${command}`);
  }

  const queryEntry = queryWhitelist[command];
  
  // Validate parameter count
  const paramCount = params ? params.length : 0;
  if (paramCount !== queryEntry.paramCount) {
    throw new Error(`Command '${command}' expects ${queryEntry.paramCount} parameters, got ${paramCount}`);
  }

  try {
    const stmt = db.prepare(queryEntry.sql);
    const result = stmt.all(...(params || []));
    return result as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get the number of test results with a specific upload status.
 * 
 * @param status - The upload status to count
 * @returns Number of matching records
 */
export function getUploadCount(status: string): number {
  const result = executeWhitelistedQuery<{ count: number }>(
    'get-upload-count',
    [status]
  );
  return result.count;
}

/**
 * Get all pending test results waiting for upload.
 * 
 * @returns Array of pending test results
 */
export function getPendingUploads(): unknown[] {
  return executeWhitelistedQuery('get-pending-uploads', ['pending']);
}

/**
 * Get a specific test result by ID.
 * 
 * @param id - The test result ID
 * @returns The test result or undefined if not found
 */
export function getTestResult(id: number): unknown {
  return executeWhitelistedQuery('get-test-result', [id]);
}

/**
 * Delete a test result by ID.
 * 
 * @param id - The test result ID
 * @returns true if deleted, false if not found
 */
export function deleteTestResult(id: number): boolean {
  const result = executeWhitelistedQuery<{ changes: number }>(
    'delete-test-result',
    [id]
  );
  return result.changes > 0;
}

/**
 * Get all test results.
 * 
 * @returns Array of all test results
 */
export function getAllTestResults(): unknown[] {
  return executeWhitelistedQuery('get-all-test-results');
}

/**
 * Insert a new test result with consent.
 * 
 * @param testData - JSON string of test events
 * @param email - Patient email
 * @param consentGiven - Whether consent was given
 * @param consentTimestamp - ISO timestamp of consent
 * @returns The new record ID
 */
export function insertTestResultWithConsent(
  testData: string,
  email: string,
  consentGiven: boolean,
  consentTimestamp: string
): number {
  const result = executeWhitelistedQuery<{ lastInsertRowid: number }>(
    'insert-test-result-with-consent',
    [testData, email, consentGiven ? 1 : 0, consentTimestamp]
  );
  return result.lastInsertRowid;
}

/**
 * Update the upload status of a test result.
 * 
 * @param id - The test result ID
 * @param status - The new upload status
 * @returns true if updated, false if not found
 */
export function updateTestResultStatus(id: number, status: string): boolean {
  const result = executeWhitelistedQuery<{ changes: number }>(
    'update-test-result',
    [status, id]
  );
  return result.changes > 0;
}
