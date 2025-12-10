import { Router } from "express";
import { 
    getCompras, 
    getComprasById, 
    createCompra, 
    deleteCompra 
} from "../controllers/compras.controller.js";

const router = Router();


router.get("/compras", getCompras);

router.get("/compras/:id", getComprasById);

router.post("/compras", createCompra);

router.delete("/compras/:id", deleteCompra);

export default router;
