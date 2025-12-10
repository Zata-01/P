import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from './config/config.js'
import { pool } from './config/db.js'

export class UserRepository {
  static async create ({ username, password, rol }) { 
    Validation.username(username)
    Validation.password(password)
    if (!rol) throw new Error('Es necesario un rol')

    const client = await pool.connect()

    try {
      const checkUser = await client.query('SELECT id FROM usuarios WHERE usuario = $1', [username])
      if (checkUser.rows.length > 0) {
        throw new Error('El usuario ya existe')
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
      if (!user) throw new Error('El usuario no existe')

      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) throw new Error('Contrasena invalida')

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
    if (typeof username !== 'string') throw new Error('El usuario debe ser un string')
    if (username.length < 3) throw new Error('El usuario debe de tener al menos 3 caracteres')
  }

  static password (password) {
    // Validaciones del password
    if (typeof password !== 'string') throw new Error('La contrasena debe ser un string')
    if (password.length < 6) throw new Error('La contrasena debe de tener al menos 6 caracteres')
  }
}