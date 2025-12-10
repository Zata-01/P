import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from './config/config.js'
import { pool } from './config/db.js'

export class UserRepository {
  static async create ({ username, password, rol }) { 
    Validation.username(username)
    Validation.password(password)
    if (!rol) throw new Error('Role is required.')

    const client = await pool.connect()

    try {
      const checkUser = await client.query('SELECT id FROM usuarios WHERE usuario = $1', [username])
      if (checkUser.rows.length > 0) {
        throw new Error('Username already exists.')
      }
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

      const result = await client.query(
        'INSERT INTO usuarios (usuario, password, rol) VALUES ($1, $2, $3) RETURNING id',
        [username, hashedPassword, rol]
      )

      return result.rows[0].id
    } finally {
      client.release()
    }
  }

  static async login ({ username, password }) {
    Validation.username(username)
    Validation.password(password)

    const client = await pool.connect()

    try {
      const result = await client.query(
        'SELECT id, usuario, password, rol FROM usuarios WHERE usuario = $1',
        [username]
      )

      const user = result.rows[0]
      if (!user) throw new Error('Username does not exist.')

      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) throw new Error('Password is invalid.')

      const { password: _, id, rol, ...publicUser } = user
      return { _id: id, rol, ...publicUser } 
    } finally {
      client.release()
    }
  }
}

class Validation {
  static username (username) {
    // Validaciones del username
    if (typeof username !== 'string') throw new Error('Username must be a string.')
    if (username.length < 3) throw new Error('Username must be at least 3 characters long.')
  }

  static password (password) {
    // Validaciones del password
    if (typeof password !== 'string') throw new Error('Password must be a string.')
    if (password.length < 6) throw new Error('Password must be at least 6 characters long')
  }
}