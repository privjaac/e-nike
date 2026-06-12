import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { config } from '@/config/Env';
import * as schema from '@/db/Schema';

const sqlite = new Database(config.databaseUrl);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
