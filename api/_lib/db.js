// One tiny database adapter used by every /api function.
//  - DATABASE_URL set   -> Neon Postgres (used on Vercel)
//  - DATABASE_URL empty -> local PGlite (real Postgres stored in ./.data/glimmora)
// Both expose the same API: query(text, params) -> rows, tx(fn), exec(sql).

import path from 'node:path'

const g = globalThis
const LOCAL_DIR = process.env.LOCAL_DB_DIR || path.resolve(process.cwd(), '.data', 'glimmora')

export const usingLocalDb = () => !process.env.DATABASE_URL

async function createLocal() {
  const { PGlite } = await import('@electric-sql/pglite')
  const { mkdirSync } = await import('node:fs')
  mkdirSync(path.dirname(LOCAL_DIR), { recursive: true })
  const db = await PGlite.create(LOCAL_DIR)
  return {
    kind: 'local',
    query: async (text, params = []) => (await db.query(text, params)).rows,
    exec: (sql) => db.exec(sql),
    tx: (fn) => db.transaction((t) => fn(async (text, params = []) => (await t.query(text, params)).rows)),
    close: () => db.close(),
  }
}

async function createNeon() {
  const { Pool, neonConfig } = await import('@neondatabase/serverless')
  if (globalThis.WebSocket) neonConfig.webSocketConstructor = globalThis.WebSocket
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return {
    kind: 'neon',
    query: async (text, params = []) => (await pool.query(text, params)).rows,
    exec: (sql) => pool.query(sql),
    tx: async (fn) => {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const result = await fn(async (text, params = []) => (await client.query(text, params)).rows)
        await client.query('COMMIT')
        return result
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {})
        throw err
      } finally {
        client.release()
      }
    },
    close: () => pool.end(),
  }
}

export function getDb() {
  if (!g.__glimmoraDb) {
    g.__glimmoraDb = (usingLocalDb() ? createLocal() : createNeon()).catch((err) => {
      g.__glimmoraDb = null
      throw err
    })
  }
  return g.__glimmoraDb
}

export const query = async (text, params) => (await getDb()).query(text, params)
export const tx = async (fn) => (await getDb()).tx(fn)
