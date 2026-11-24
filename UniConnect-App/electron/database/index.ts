import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { seedDatabase } from './seed';
import { SCHEMA_SQL } from './schema';

let dbInstance: Database | null = null;
let dbFilePath = '';

function findWasmBinary(): string {
  const possiblePaths = [
    path.join(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm'),
    path.join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm'),
    path.join(process.resourcesPath || '', 'sql-wasm.wasm'),
    path.join(process.resourcesPath || '', 'app.asar.unpacked/node_modules/sql.js/dist/sql-wasm.wasm'),
    path.join(__dirname, 'sql-wasm.wasm'),
    path.resolve(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return '';
}

export async function initDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const wasmPath = findWasmBinary();
  const SQL: SqlJsStatic = await initSqlJs({
    locateFile: (file) => {
      if (file.endsWith('.wasm')) {
        return wasmPath || file;
      }
      return file;
    },
  });

  const userDataDir = app ? app.getPath('userData') : path.join(process.cwd(), '.data');
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  dbFilePath = path.join(userDataDir, 'uniconnect.sqlite');

  if (fs.existsSync(dbFilePath)) {
    try {
      const fileBuffer = fs.readFileSync(dbFilePath);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.error('Failed to load existing database, creating fresh one:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Execute schema
  dbInstance.run(SCHEMA_SQL);

  // Seed with rich initial data if empty
  seedDatabase(dbInstance);

  // Persist to disk
  persistDatabase();

  return dbInstance;
}

export function persistDatabase(): void {
  if (!dbInstance || !dbFilePath) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error('Error persisting database to disk:', err);
  }
}

export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  if (!dbInstance) throw new Error('Database not initialized');
  const stmt = dbInstance.prepare(sql);
  if (params && params.length > 0) {
    stmt.bind(params);
  }
  const results: T[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as unknown as T;
    results.push(row);
  }
  stmt.free();
  return results;
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const rows = queryAll<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function run(sql: string, params: any[] = []): { success: boolean; changes: number } {
  if (!dbInstance) throw new Error('Database not initialized');
  const stmt = dbInstance.prepare(sql);
  if (params && params.length > 0) {
    stmt.bind(params);
  }
  stmt.step();
  stmt.free();
  persistDatabase();
  return { success: true, changes: 1 };
}
