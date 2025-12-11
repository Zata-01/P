import { Router } from "express";
import { 
    getVentasPorFechas, 
    getComprasPorFechas, 
    getInventarioReport, 
    getDevolucionesReport 
} from "../controllers/reportes.controller.js";

const router = Router();

router.get("/reportes/ventas", getVentasPorFechas);
router.get("/reportes/compras", getComprasPorFechas);
router.get("/reportes/inventario", getInventarioReport);
router.get("/reportes/devoluciones", getDevolucionesReport);

export default router;