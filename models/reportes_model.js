import db from "../database/db.js";

export const totalVendido = async (inicio, fin) => {
    const [rows] = await db.execute(
        `SELECT SUM(total) AS total_vendido
         FROM ventas
         WHERE fecha BETWEEN ? AND ?`,
        [inicio, fin]
    );
    return rows[0];
};

export const productosMasVendidos = async (inicio, fin) => {
    const [rows] = await db.execute(
        `SELECT i.nombre, SUM(vd.cantidad) AS unidades_vendidas
         FROM ventas_det vd
         JOIN ventas v ON v.id = vd.venta_id
         JOIN items i ON i.id = vd.item_id
         WHERE v.fecha BETWEEN ? AND ?
         GROUP BY vd.item_id
         ORDER BY unidades_vendidas DESC`,
        [inicio, fin]
    );
    return rows;
};