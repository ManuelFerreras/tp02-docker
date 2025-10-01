const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const APP_ENV = process.env.APP_ENV || 'dev';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

const pool = new Pool({ connectionString: DATABASE_URL });

async function ensureSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        env TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
  } finally {
    client.release();
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: APP_ENV });
});

app.get('/env', (_req, res) => {
  res.json({ APP_ENV, LOG_LEVEL, PORT, DATABASE_URL: '[redacted]' });
});

app.get('/db/ping', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT 1 as ok');
    res.json({ db: 'up', result: rows[0] });
  } catch (e) {
    res.status(500).json({ db: 'down', error: e.message });
  }
});

app.get('/messages', async (_req, res) => {
  const { rows } = await pool.query('SELECT id, content, env, created_at FROM messages ORDER BY id DESC');
  res.json(rows);
});

app.post('/messages', async (req, res) => {
  const { content } = req.body || {};
  if (!content) return res.status(400).json({ error: 'content requerido' });
  const { rows } = await pool.query(
    'INSERT INTO messages (content, env) VALUES ($1, $2) RETURNING id, content, env, created_at',
    [content, APP_ENV]
  );
  res.status(201).json(rows[0]);
});

app.listen(PORT, async () => {
  await ensureSchema();
  console.log(`[app] listening on ${PORT} env=${APP_ENV} log=${LOG_LEVEL}`);
});
