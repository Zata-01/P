import express from "express";
import dotenv from "dotenv";
import productosRoutes from "./routes/productos.routes.js";
import carritoRoutes from "./routes/carrito.routes.js";
import comprasRoutes from "./routes/compras.routes.js";
import ventasRoutes from "./routes/ventas.routes.js";
import devolucionesRoutes from "./routes/devoluciones.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import { PORT, SECRET_JWT_KEY } from './config/config.js';
import { UserRepository } from './user-repository.js';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import path from "path";
import { fileURLToPath } from "url";
import notifier from 'node-notifier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requireSession = (req, res, next) => {
  if (!req.session.user) {
    return res.status(403).send('Acceso denegado, necesita sesion')
  }
  next()
}

const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.rol !== 'admin') {
    return res.status(403).send('Prohibido, solo administradores')
  }
  next()
}

const preventCache = (req, res, next) => {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.set('Expires', '0');
    res.set('Pragma', 'no-cache');
    next();
};

dotenv.config();

const app = express();
app.use(express.static("public"))
app.use(express.json());
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

app.use('/api', comprasRoutes);
app.use('/api', productosRoutes);
app.use('/api', ventasRoutes);
app.use('/api', devolucionesRoutes);
app.use('/api', carritoRoutes);
app.use('/api', reportesRoutes);
app.use('/api', usuariosRoutes)

app.set("views", path.join(__dirname, "public"));
app.set("view engine", "ejs");

app.get('/', (req, res) => {
  const { user } = req.session
  res.render('index.ejs', user)
})

app.get('/dashboard', requireSession, preventCache, (req, res) => {
  const { user } = req.session
  res.render('dashboard.ejs', user)
})

app.get('/productos', requireSession, requireAdmin, preventCache,(req, res) => {
  const { user } = req.session
  res.render('productos.ejs', user)
})

app.get('/compras', requireSession, requireAdmin, preventCache,(req, res) => {
  const { user } = req.session
  res.render('compras.ejs', user)
})

app.get('/ventas', requireSession, preventCache,(req, res) => {
  const { user } = req.session
  res.render('ventas.ejs', user)
})

app.get('/devoluciones', requireSession, preventCache,(req, res) => {
  const { user } = req.session
  res.render('devoluciones.ejs', user)
})

app.get('/usuarios', requireSession, requireAdmin, preventCache,(req, res) => {
  const { user } = req.session
  res.render('usuarios.ejs', user)
})

app.get('/reportes', requireSession, requireAdmin, preventCache,(req, res) => {
  const { user } = req.session
  res.render('reportes.ejs', user)
})


app.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign({ id: user._id, username: user.username, rol: user.rol }, SECRET_JWT_KEY, {
      expiresIn: '1h'
    })
    res.cookie('access_token', token, {
      httpOnly: true, // acessible solamente del lado del servidor
      secure: process.env.NODE_ENV === 'production', // cookie accesible solamente en https
      sameSite: 'strict', // cookie accesible solamente desde el mismo dominio
      maxAge: 1000 * 60 * 60 // 1 hora máximo de validez para la cookie
    }).send({ user })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(401).send(error.message)

    notifier.notify({
      title: 'Error en login',
      message: error.message,
      sound: true
    });
  }
})

app.post('/register', async (req, res) => {
  const { username, password, rol } = req.body 
  
  if (rol !== 'admin' && rol !== 'usuario') {
      return res.status(400).send('Rol invalido')
  }

  try {
    const id = await UserRepository.create({ username, password, rol }) 
    res.send({ id })
  } catch (error) {
    res.status(400).send(error.message)
    console.error('Error en registro:', error)
    notifier.notify({
      title: 'Error en registro',
      message: error.message,
      sound: true
    });
  }
})

app.post('/logout', (req, res) => {
    res.clearCookie('access_token', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
    }).json({ message: 'Logout successful'})
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
