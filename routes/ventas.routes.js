import { Router } from "express";
import {getVentas, getVentaById, createVenta, deleteVenta} from "../controllers/ventas.controller.js";

const router = Router();
router.get("/ventas", getVentas);
router.get("/ventas/:id", getVentaById );//Obtiene la venta por ID
router.post("/ventas/", createVenta)
router.delete("/ventas/:id", deleteVenta ) //Elimina ventas por ID


export default router;