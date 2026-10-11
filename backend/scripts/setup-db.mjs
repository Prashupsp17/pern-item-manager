import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const { Client } = pg;

const connectionString = process.env.DATABASE_URL;
const useSsl =
  process.env.DATABASE_SSL === 'true' ||
  Boolean(connectionString?.includes('neon.tech'));

const ssl = useSsl ? { rejectUnauthorized: false } : undefined;

const config = connectionString
  ? { connectionString, ssl }
  : {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT ?? 5432),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      ssl,
    };

const dbName = connectionString
  ? new URL(connectionString).pathname.replace(/^\//, '') || 'neondb'
  : (process.env.DATABASE_NAME ?? 'pern_db');

function clientConfig(database) {
  if (connectionString) {
    const url = new URL(connectionString);
    url.pathname = `/${database}`;
    return { connectionString: url.toString(), ssl };
  }
  return { ...config, database };
}

async function setupDatabase() {
  if (!useSsl) {
    const admin = new Client({ ...config, database: 'postgres' });
    await admin.connect();

    const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (exists.rowCount === 0) {
      await admin.query(`CREATE DATABASE ${dbName}`);
      console.log(`Created database: ${dbName}`);
    } else {
      console.log(`Database already exists: ${dbName}`);
    }

    await admin.end();
  } else {
    console.log('Using remote database (SSL); skipping CREATE DATABASE');
  }

  const initSql = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '..', 'docker', 'init.sql'),
    'utf8',
  );

  const app = new Client(clientConfig(dbName));
  await app.connect();
  await app.query(initSql);
  await app.end();

  console.log('Schema initialized successfully');
}

setupDatabase().catch((error) => {
  console.error('Database setup failed:', error.message);
  process.exit(1);
});
