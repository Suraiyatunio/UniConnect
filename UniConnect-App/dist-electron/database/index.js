"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.persistDatabase = persistDatabase;
exports.queryAll = queryAll;
exports.queryOne = queryOne;
exports.run = run;
const sql_js_1 = __importDefault(require("sql.js"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const seed_1 = require("./seed");
const schema_1 = require("./schema");
let dbInstance = null;
let dbFilePath = '';
function findWasmBinary() {
    const possiblePaths = [
        path_1.default.join(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm'),
        path_1.default.join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm'),
        path_1.default.join(process.resourcesPath || '', 'sql-wasm.wasm'),
        path_1.default.join(process.resourcesPath || '', 'app.asar.unpacked/node_modules/sql.js/dist/sql-wasm.wasm'),
        path_1.default.join(__dirname, 'sql-wasm.wasm'),
        path_1.default.resolve(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm'),
    ];
    for (const p of possiblePaths) {
        if (fs_1.default.existsSync(p)) {
            return p;
        }
    }
    return '';
}
async function initDatabase() {
    if (dbInstance)
        return dbInstance;
    const wasmPath = findWasmBinary();
    const SQL = await (0, sql_js_1.default)({
        locateFile: (file) => {
            if (file.endsWith('.wasm')) {
                return wasmPath || file;
            }
            return file;
        },
    });
    const userDataDir = electron_1.app ? electron_1.app.getPath('userData') : path_1.default.join(process.cwd(), '.data');
    if (!fs_1.default.existsSync(userDataDir)) {
        fs_1.default.mkdirSync(userDataDir, { recursive: true });
    }
    dbFilePath = path_1.default.join(userDataDir, 'uniconnect.sqlite');
    if (fs_1.default.existsSync(dbFilePath)) {
        try {
            const fileBuffer = fs_1.default.readFileSync(dbFilePath);
            dbInstance = new SQL.Database(fileBuffer);
        }
        catch (err) {
            console.error('Failed to load existing database, creating fresh one:', err);
            dbInstance = new SQL.Database();
        }
    }
    else {
        dbInstance = new SQL.Database();
    }
    // Execute schema
    dbInstance.run(schema_1.SCHEMA_SQL);
    // Seed with rich initial data if empty
    (0, seed_1.seedDatabase)(dbInstance);
    // Persist to disk
    persistDatabase();
    return dbInstance;
}
function persistDatabase() {
    if (!dbInstance || !dbFilePath)
        return;
    try {
        const data = dbInstance.export();
        const buffer = Buffer.from(data);
        fs_1.default.writeFileSync(dbFilePath, buffer);
    }
    catch (err) {
        console.error('Error persisting database to disk:', err);
    }
}
function queryAll(sql, params = []) {
    if (!dbInstance)
        throw new Error('Database not initialized');
    const stmt = dbInstance.prepare(sql);
    if (params && params.length > 0) {
        stmt.bind(params);
    }
    const results = [];
    while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row);
    }
    stmt.free();
    return results;
}
function queryOne(sql, params = []) {
    const rows = queryAll(sql, params);
    return rows.length > 0 ? rows[0] : null;
}
function run(sql, params = []) {
    if (!dbInstance)
        throw new Error('Database not initialized');
    const stmt = dbInstance.prepare(sql);
    if (params && params.length > 0) {
        stmt.bind(params);
    }
    stmt.step();
    stmt.free();
    persistDatabase();
    return { success: true, changes: 1 };
}
