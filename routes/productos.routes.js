import { Router } from "express";
import {getProductos, addProducts, updateProducts, deleteProducts} from "../controllers/productos.controller.js";

const router = Router();
router.get("/productos", getProductos);
router.post("/productos", addProducts );
router.put("/productos/:id", updateProducts) //Actualiza productos por ID
router.delete("/productos/:id", deleteProducts ) //Elimina productos por ID


export default router;