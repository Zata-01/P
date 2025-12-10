import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import productosRoutes from "./routes/productos.routes.js";
import carritoRoutes from "./routes/carrito.routes.js";
import comprasRoutes from "./routes/compras.routes.js";
import ventasRoutes from "./routes/ventas.routes.js";
import devolucionesRoutes from "./routes/devoluciones.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";
import { PORT, SECRET_JWT_KEY } from './config/config.js';
import { UserRepository } from './user-repository.js';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "secret_dev",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.get("/", (req, res) => {
  res.json({ message: "Backend funcionando" });
});

app.use('/api', comprasRoutes);
app.use('/api', productosRoutes);
app.use('/api', ventasRoutes);
app.use('/api', devolucionesRoutes);
app.use('/api', carritoRoutes);
app.use('/api', reportesRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.set('view engine', 'ejs')
app.use(express.json())
app.use(cookieParser())
app.use((req, res, next) => {
  const token = req.cookies.access_token
  req.session = { user: null }
  try {
    const data = jwt.verify(token, SECRET_JWT_KEY)
    req.session.user = data
  } catch {}

  next()
})

app.get('/', (req, res) => {
  const { user } = req.session
  res.render('index', user)
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
app.post('/logout', (req, res) => {
  res.clearCookie('access_token').json({ message: 'Logout successful' })
})

app.get('/protected', (req, res) => {
  const { user } = req.session
  if (!user) return res.status(403).send('Access not authorized')
  res.render('protected', user)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
