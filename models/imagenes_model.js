import db from "../database/db.js";

export const obtenerMiniatura = async (itemId) => {
    const [rows] = await db.execute(
        `SELECT imagen
         FROM imagenes_item
         WHERE item_id = ?
         LIMIT 1`,
        [itemId]
    );
    return rows[0] || null;
};

export const obtenerImagenesPorItem = async (itemId) => {
    const [rows] = await db.execute(
        `SELECT id, imagen
         FROM imagenes_item
         WHERE item_id = ?`,
        [itemId]
    );
    return rows;
};