import { Router } from "express";
import { 
    getUsers, 
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from "../controllers/usuarios.controller.js";

const router = Router();

router.get("/usuarios", getUsers);

router.get("/usuarios/:id", getUserById);

router.post("/usuarios", createUser);

router.put("/usuarios/:id", updateUser);

router.delete("/usuarios/:id", deleteUser);

export default router;