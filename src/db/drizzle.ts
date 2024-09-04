import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '~/configs/env.config';
import * as schema from './schema';

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV !== 'production',
});
export type Database = typeof db;
