import { pool } from "../config/db.js";
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../config/config.js';

class Validation {
    static username (username) {
        if (typeof username !== 'string') throw new Error('El usuario debe ser un string')
        if (username.length < 3) throw new Error('El usuario debe de tener al menos 3 caracteres')
    }

    static password (password) {
        if (typeof password !== 'string') throw new Error('La contrasena debe ser un string')
        if (password.length < 6) throw new Error('La contrasena debe de tener al menos 6 caracteres')
    }
}

export const getUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, usuario, rol FROM usuarios ORDER BY id ASC`
        );
        return res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT id, usuario, rol FROM usuarios WHERE id = $1`,
            [id]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.json(user);
    } catch (error) {
        console.error("Error al obtener usuario por ID:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const createUser = async (req, res) => {
    const client = await pool.connect();
    try {
        const { usuario, password, rol } = req.body;
        
        Validation.username(usuario);
        Validation.password(password);
        if (!rol) throw new Error('Es necesario un rol');

        const checkUser = await client.query('SELECT id FROM usuarios WHERE usuario = $1', [usuario]);
        if (checkUser.rows.length > 0) {
            throw new Error('El usuario ya existe');
        }
        
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await client.query(
            `INSERT INTO usuarios (usuario, password, rol) 
             VALUES ($1, $2, $3) 
             RETURNING id`,
            [usuario, hashedPassword, rol]
        );
        
        client.release();
        return res.status(201).json({ 
            message: "Usuario creado exitosamente",
            id: result.rows[0].id
        });

    } catch (error) {
        client.release();
        console.error("Error al crear usuario:", error);
        return res.status(400).json({ message: error.message || "Error al crear usuario" });
    }
};

export const updateUser = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { usuario, password, rol } = req.body;
        
        const columnas = [];
        const valores = [];
        let idx = 1;

        if (usuario !== undefined) { columnas.push(`usuario = $${idx++}`); valores.push(usuario); }
        if (rol !== undefined) { columnas.push(`rol = $${idx++}`); valores.push(rol); }

        if (password !== undefined && password.length > 0) {
            Validation.password(password);
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            columnas.push(`password = $${idx++}`);
            valores.push(hashedPassword);
        }

        if (columnas.length === 0) {
            client.release();
            return res.json({ message: "No se realizaron cambios" }); 
        }

        const sql = `UPDATE usuarios SET ${columnas.join(', ')} WHERE id = $${idx}`;
        valores.push(id);

        const result = await client.query(sql, valores);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.json({ message: "Usuario actualizado exitosamente" });

    } catch (error) {
        client.release();
        console.error("Error al actualizar usuario:", error);
        return res.status(400).json({ message: error.message || "Error al actualizar usuario" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM usuarios WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};