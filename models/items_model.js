import db from "../database/db.js";

export const buscarItems = async (q) => {
    const [rows] = await db.execute(
        `SELECT i.id, i.nombre, i.descripcion, i.precio, i.estado, e.stock
         FROM items i
         JOIN existencias e ON e.item_id = i.id
         WHERE i.nombre LIKE CONCAT('%', ?, '%')
            OR i.descripcion LIKE CONCAT('%', ?, '%')`,
        [q, q]
    );
    return rows;
};

export const obtenerItemPorId = async (id) => {
    const [rows] = await db.execute(
        `SELECT i.id, i.nombre, i.descripcion, i.precio, i.estado, e.stock
         FROM items i
         JOIN existencias e ON e.item_id = i.id
         WHERE i.id = ?`,
        [id]
    );
    return rows[0] || null;
};

export const miniaturaPorItem = async (id) => {
    const [rows] = await db.execute(
        `SELECT imagen
         FROM imagenes_item
         WHERE item_id = ?
         LIMIT 1`,
        [id]
    );
    return rows[0] || null;
};