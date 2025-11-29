import {Router} from "express";
import {addToCart, getCart, clearCart} from "../controllers/carrito.controller.js"

const router = Router()

router.get('/', getCart); //Obtener Carrito

router.post('/add', addToCart); //Agregar Productos

router.post('/clear', clearCart); //Obtener Carrito

export default router;