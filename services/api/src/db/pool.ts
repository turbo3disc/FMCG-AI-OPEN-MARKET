import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://fmcg:fmcg@localhost:5432/fmcg',
  max: 20,
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
