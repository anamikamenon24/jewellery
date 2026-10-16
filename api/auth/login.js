import bcrypt from 'bcryptjs'
import { handle, getBody, HttpError } from '../_lib/http.js'
import { query } from '../_lib/db.js'
import { setSession, publicUser } from '../_lib/auth.js'

export default handle({
  async POST(req, res) {
    const { email = '', password = '' } = getBody(req)
    const mail = String(email).trim().toLowerCase()
    if (!mail || !password) throw new HttpError(400, 'Enter your email and password.')
    const [user] = await query('SELECT * FROM users WHERE email = $1', [mail])
    const ok = user && user.password_hash.startsWith('$2') && (await bcrypt.compare(String(password), user.password_hash))
    if (!ok) throw new HttpError(401, 'That email and password don’t match. Please try again.')
    await setSession(res, user.id)
    return { user: publicUser(user) }
  },
})
