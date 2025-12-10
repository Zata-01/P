import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import productosRoutes from "./routes/productos.routes.js";
import carritoRoutes from "./routes/carrito.routes.js";
import comprasRoutes from "./routes/compras.routes.js";
import ventasRoutes from "./routes/ventas.routes.js";
import devolucionesRoutes from "./routes/devoluciones.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";





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