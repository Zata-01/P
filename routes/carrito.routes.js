import { Router } from "express";
import { addToCart, getCart, clearCart } from "../controllers/carrito.controller.js";

const router = Router();

// Obtener carrito
router.get("/carrito", getCart);

// Agregar producto al carrito
router.post("/carrito", addToCart);

// Vaciar carrito
router.delete("/carrito", clearCart);

export default router;
