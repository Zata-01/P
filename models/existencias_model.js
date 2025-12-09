import db from "../database/db.js";

export const resumenExistencias = async () => {
    const [rows] = await db.execute(
        `SELECT i.id, i.nombre, i.precio, i.estado, e.stock
         FROM items i
         JOIN existencias e ON e.item_id = i.id
         ORDER BY i.nombre ASC`
    );
    return rows;
};