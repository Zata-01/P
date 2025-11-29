import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import productosRoutes from "./routes/productos.routes.js";
import carritoRoutes from "./routes/carrito.routes.js";

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

app.use("/api", productosRoutes);
app.use("/api/carrito", carritoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});