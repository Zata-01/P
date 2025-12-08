import { Router } from "express";
import { addToCart, getCart, clearCart } from "../controllers/carrito.controller.js";

const router = Router();

// Obtener carrito
router.get("/", getCart);

// Agregar producto al carrito
router.post("/add", addToCart);

// Vaciar carrito
router.delete("/clear", clearCart);

export default router;
