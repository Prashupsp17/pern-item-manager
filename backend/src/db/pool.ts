import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const useSsl =
  process.env.DATABASE_SSL === 'true' ||
  Boolean(connectionString?.includes('neon.tech'));

const ssl = useSsl ? { rejectUnauthorized: false } : undefined;

export const pool = connectionString
  ? new Pool({ connectionString, ssl })
  : new Pool({
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT ?? 5432),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      ssl,
    });
