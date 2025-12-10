import express from "express";
import {
  getVentasPorFechas,
  getComprasPorFechas,
  getProductosMasVendidos,
  getExistenciasActuales,
  getVentasPorUsuario,
  getTotalVendido
} from "../controllers/reportes.controller.js";

const router = express.Router();

router.get("/ventas", getVentasPorFechas);

router.get("/compras", getComprasPorFechas);


router.get("/productos-mas-vendidos", getProductosMasVendidos);

router.get("/existencias", getExistenciasActuales);


router.get("/ventas/usuario/:usuario_id", getVentasPorUsuario);


router.get("/total-vendido", getTotalVendido);

export default router;
