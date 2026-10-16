// Runs db/schema.sql then db/seed.sql inside one transaction. Safe to run repeatedly.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDb } from '../api/_lib/db.js'

const root = fileURLToPath(new URL('..', import.meta.url))

export async function runSetup() {
  const db = await getDb()
  const schema = await readFile(path.join(root, 'db', 'schema.sql'), 'utf8')
  const seed = await readFile(path.join(root, 'db', 'seed.sql'), 'utf8')
  // Make "ends tonight" mean tonight in the local time zone of the machine running setup.
  const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC').replace(/'/g, '')
  await db.exec(`BEGIN;\nSET LOCAL TIME ZONE '${tz}';\n${schema.replace(/^﻿/, '')}\n${seed.replace(/^﻿/, '')}\nCOMMIT;`)
  return db
}

export async function rowCounts(db) {
  const tables = ['products', 'product_images', 'coupons', 'deals', 'reviews', 'users', 'orders']
  const out = {}
  for (const t of tables) out[t] = (await db.query(`SELECT count(*)::int AS n FROM ${t}`))[0].n
  return out
}

export async function isSetUp(db) {
  const [row] = await db.query(`SELECT to_regclass('public.products') IS NOT NULL AS ok`)
  if (!row.ok) return false
  const [{ n }] = await db.query('SELECT count(*)::int AS n FROM products')
  return n > 0
}
