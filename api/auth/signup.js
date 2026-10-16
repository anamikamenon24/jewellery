import bcrypt from 'bcryptjs'
import { handle, getBody, HttpError } from '../_lib/http.js'
import { query } from '../_lib/db.js'
import { setSession, publicUser } from '../_lib/auth.js'

export default handle({
  async POST(req, res) {
    const { fullName = '', email = '', phone = '', password = '' } = getBody(req)
    const name = String(fullName).trim()
    const mail = String(email).trim().toLowerCase()
    const tel = String(phone).replace(/\D/g, '').slice(-10)
    const fields = {}
    if (name.length < 2) fields.fullName = 'Please tell us your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) fields.email = 'Please enter a valid email address.'
    if (!/^[6-9]\d{9}$/.test(tel)) fields.phone = 'Enter a valid 10-digit mobile number.'
    if (String(password).length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      fields.password = 'Use at least 8 characters with a letter and a number.'
    }
    if (Object.keys(fields).length) throw new HttpError(400, 'Please check the highlighted fields.', { fields })

    const [exists] = await query('SELECT 1 FROM users WHERE email = $1', [mail])
    if (exists) throw new HttpError(409, 'An account with this email already exists. Try signing in instead.', { fields: { email: 'Already registered.' } })

    const hash = await bcrypt.hash(String(password), 10)
    const [user] = await query(
      `INSERT INTO users (email, password_hash, full_name, phone) VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING RETURNING *`,
      [mail, hash, name, tel]
    )
    if (!user) throw new HttpError(409, 'An account with this email already exists. Try signing in instead.')
    await setSession(res, user.id)
    return { user: publicUser(user) }
  },
})
