import { handle } from './_lib/http.js'
import { query } from './_lib/db.js'

export default handle({
  async GET() {
    await query('SELECT 1')
    return { ok: true }
  },
})
