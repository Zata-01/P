import { Router } from "express";
import {getProductos, addProduct, updateProduct, deleteProduct} from "../controllers/productos.controller.js";

const router = Router();
router.get("/productos", getProductos);
router.post("/productos", addProduct );
router.put("/productos/:id", updateProduct) //Actualiza productos por ID
router.delete("/productos/:id", deleteProduct ) //Elimina productos por ID

export default router;