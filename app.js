import express from 'express'
import { PORT, SECRET_JWT_KEY } from './config/config.js'
import { UserRepository } from './user-repository.js'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'

const app = express()
app.set('view engine', 'ejs')
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
  const token = req.cookies.access_token
  if (!token) return res.render('index')

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY)
    res.render('index', data)
  } catch (error) {
    res.render('index')
  }
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign({ id: user._id, username: user.username }, SECRET_JWT_KEY, {
      expiresIn: '1h'
    })
    res.cookie('access_token', token, {
      httpOnly: true, // acessible solamente del lado del servidor
      secure: process.env.NODE_ENV === 'production', // cookie accesible solamente en https
      sameSite: 'strict', // cookie accesible solamente desde el mismo dominio
      maxAge: 1000 * 60 * 60 // 1 hora máximo de validez para la cookie
    }).send({ user })
  } catch (error) {
    res.status(401).send(error.message)
  }
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body
  console.log({ username, password })

  try {
    const id = await UserRepository.create({ username, password })
    res.send({ id })
  } catch (error) {
    res.status(400).send(error.message)
  }
})
app.post('/logout', (req, res) => {})

app.get('/protected', (req, res) => {
  const token = req.cookies.access_token
  if (!token) {
    return res.status(403).send('Access not authorized')
  }

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY)
    res.render('protected', data)
  } catch (error) {
    res.status(401).send('Access not authorized')
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
