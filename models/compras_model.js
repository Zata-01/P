import db from "../database/db.js";

export const reporteComprasPorFecha = async (inicio, fin) => {
    const [rows] = await db.execute(
        `SELECT c.id AS folio, c.fecha, c.proveedor,
                c.iva, c.total, u.usuario
         FROM compras c
         JOIN usuarios u ON u.id = c.usuario_id
         WHERE c.fecha BETWEEN ? AND ?
         ORDER BY c.fecha DESC`,
        [inicio + " 00:00:00", fin + " 23:59:59"]
    );
    return rows;
};

export const detallesCompra = async (compraId) => {
    const [rows] = await db.execute(
        `SELECT cd.cantidad, cd.costo, i.nombre
         FROM compras_det cd
         JOIN items i ON i.id = cd.item_id
         WHERE cd.compra_id = ?`,
        [compraId]
    );
    return rows;
};