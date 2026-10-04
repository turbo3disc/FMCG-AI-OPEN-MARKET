import pg from 'pg';

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://fmcg:fmcg@localhost:5432/fmcg';

// Neon / managed Postgres requires TLS. pg honors sslmode in the URL on
// most hosts, but set it explicitly so production (sslmode=require) works.
const needsSSL =
  connectionString.includes('sslmode=require') ||
  connectionString.includes('neon.tech') ||
  process.env.PGSSL === '1';

export const pool = new Pool({
  connectionString,
  max: 20,
  ...(needsSSL ? { ssl: { rejectUnauthorized: false } } : {}),
});

export type TxClient = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>>; rowCount: number | null }>;
};

export async function withTx<T>(fn: (tx: TxClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tx: TxClient = {
      query: (text: string, params?: unknown[]) =>
        client.query(text, params as never[]) as unknown as Promise<{
          rows: Array<Record<string, unknown>>;
          rowCount: number | null;
        }>,
    };
    const out = await fn(tx);
    await client.query('COMMIT');
    return out;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
