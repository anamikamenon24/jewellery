// npm run db:setup  ->  creates tables (db/schema.sql) and loads sample data (db/seed.sql)
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { runSetup, rowCounts } from '../server/setup-db.js'
import { usingLocalDb } from '../api/_lib/db.js'

const lockFile = path.resolve('.data', 'api-server.lock')

const isRunning = (pid) => {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

if (usingLocalDb() && existsSync(lockFile)) {
  const pid = Number(readFileSync(lockFile, 'utf8'))
  if (pid && isRunning(pid)) {
    console.error('\n✋ The local database is in use by "npm run dev" (process ' + pid + ').')
    console.error('   Stop the dev server (Ctrl+C), then run "npm run db:setup" again.\n')
    process.exit(1)
  }
}

console.log(`\n✨ Setting up Glimmora database (${usingLocalDb() ? 'local PGlite in .data/glimmora' : 'Neon via DATABASE_URL'})…`)
try {
  const db = await runSetup()
  const counts = await rowCounts(db)
  console.log('\n✅ Done. Row counts:')
  console.table(counts)
  await db.close()
  process.exit(0)
} catch (err) {
  console.error('\n❌ Database setup failed:', err.message)
  process.exit(1)
}
