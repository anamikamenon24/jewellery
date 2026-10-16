// Local stand-in for Vercel's /api runtime. It loads the SAME files Vercel will deploy:
//   api/stats.js             -> /api/stats
//   api/products/index.js    -> /api/products
//   api/products/[slug].js   -> /api/products/:slug
// Files and folders starting with "_" (like api/_lib) are helpers, not routes — same rule as Vercel.
import express from 'express'
import { readdirSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { getDb, usingLocalDb } from '../api/_lib/db.js'
import { isSetUp, runSetup, rowCounts } from './setup-db.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const apiDir = path.join(root, 'api')
const PORT = Number(process.env.API_PORT || 4317)

function collectRoutes(dir, prefix = '') {
  const routes = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      routes.push(...collectRoutes(full, `${prefix}/${entry.name.replace(/^\[(.+)\]$/, ':$1')}`))
    } else if (entry.name.endsWith('.js')) {
      const base = entry.name.slice(0, -3)
      const segment = base === 'index' ? '' : `/${base.replace(/^\[(.+)\]$/, ':$1')}`
      routes.push({ route: `/api${prefix}${segment}` || '/api', file: full })
    }
  }
  return routes
}

// Static segments win over dynamic ones (/api/orders before /api/orders/:id), like Vercel.
const routes = collectRoutes(apiDir).sort((a, b) => (a.route.includes(':') ? 1 : 0) - (b.route.includes(':') ? 1 : 0))

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '200kb' }))

for (const { route, file } of routes) {
  const mod = await import(pathToFileURL(file).href)
  const handler = mod.default
  app.all(route, (req, res) => {
    // Vercel merges dynamic segments into req.query
    Object.defineProperty(req, 'query', { value: { ...req.query, ...req.params }, writable: true, configurable: true })
    return handler(req, res)
  })
}

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

// Lock file lets "npm run db:setup" know the local database is in use.
const lockFile = path.join(root, '.data', 'api-server.lock')
if (usingLocalDb()) {
  mkdirSync(path.dirname(lockFile), { recursive: true })
  writeFileSync(lockFile, String(process.pid))
}

let shuttingDown = false
const shutdown = async () => {
  if (shuttingDown) return
  shuttingDown = true
  try {
    rmSync(lockFile, { force: true })
    await (await getDb()).close()
  } catch {}
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

try {
  if (!process.env.JWT_SECRET) console.warn('⚠️  JWT_SECRET is missing from .env — sign-in will not work.')
  const db = await getDb()
  if (!(await isSetUp(db))) {
    console.log('📦 Empty database found — running first-time setup…')
    await runSetup()
    console.table(await rowCounts(db))
  }
  console.log(`💎 Glimmora API ready on http://localhost:${PORT}/api  (${usingLocalDb() ? 'local database: .data/glimmora' : 'Neon'})`)
} catch (err) {
  console.error('❌ Could not open the database:', err.message)
}

app.listen(PORT).on('error', (err) => {
  if (err.code === 'EADDRINUSE') console.error(`❌ Port ${PORT} is already in use by another program. Set API_PORT in .env to a free port.`)
  else console.error(err)
  shutdown()
})
