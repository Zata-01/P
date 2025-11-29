import { Router } from "express";
import {getProductos, addProductos, updateProductos, deleteProductos} from "../controllers/productos.controller.js";

const router = Router();
router.get("/productos", getProductos);

export default router;