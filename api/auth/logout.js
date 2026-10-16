import { handle } from '../_lib/http.js'
import { clearSession } from '../_lib/auth.js'

export default handle({
  async POST(req, res) {
    clearSession(res)
    return { ok: true }
  },
})
