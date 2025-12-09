import express from 'express'
import { PORT } from './config/config.js'
import { UserRepository } from './user-repository.js'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello friend')
})

app.post('/login', (req, res) => {})
app.post('/register', (req, res) => {
  const { username, password } = req.body
  console.log(req.body)

  try {
    const id = UserRepository.create({ username, password })
    res.send({ id })
  } catch (error) {
    res.status(400).send(error.message)
  }
})
app.post('/logout', (req, res) => {})

app.post('/protected', (req, res) => {})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
