import { Router } from "express";
import {getProductos, addProduct, updateProduct, deleteProduct, getProductoById} from "../controllers/productos.controller.js";

const router = Router();
router.get("/productos", getProductos);
router.get("/productos/:id", getProductoById);
router.post("/productos", addProduct );
router.put("/productos/:id", updateProduct);
router.delete("/productos/:id", deleteProduct);

export default router;