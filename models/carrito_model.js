import db from "../database/db.js";

export const agregarAlCarrito = async (usuarioId, itemId, cantidad) => {
    const [result] = await db.execute(
        `INSERT INTO carrito (usuario_id, item_id, cantidad)
         VALUES (?, ?, ?)`,
        [usuarioId, itemId, cantidad]
    );
    return result.insertId;
};

export const verCarrito = async (usuarioId) => {
    const [rows] = await db.execute(
        `SELECT c.id, i.nombre, i.precio, c.cantidad,
                (i.precio * c.cantidad) AS total_parcial
         FROM carrito c
         JOIN items i ON i.id = c.item_id
         WHERE c.usuario_id = ?`,
        [usuarioId]
    );
    return rows;
};

export const eliminarDelCarrito = async (carritoId) => {
    await db.execute(
        `DELETE FROM carrito WHERE id = ?`,
        [carritoId]
    );
};

export const limpiarCarrito = async (usuarioId) => {
    await db.execute(
        `DELETE FROM carrito WHERE usuario_id = ?`,
        [usuarioId]
    );
};