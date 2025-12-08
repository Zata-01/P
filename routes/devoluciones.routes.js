import { Router } from "express";
import {getDevoluciones, getDevolucionById, createDevolucion, deleteDevolucion} from "../controllers/devoluciones.controller.js";
const router = Router();


router.get("/devoluciones", getDevoluciones);


router.get("/devoluciones/:id", getDevolucionById);


router.post("/devoluciones", createDevolucion);


router.delete("/devoluciones/:id", deleteDevolucion);

export default router;
