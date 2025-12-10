import { pool } from "../config/db.js";

// Reporte de compras por fecha
export const reporteComprasPorFecha = async (inicio, fin) => {
    const result = await pool.query(
        `SELECT c.id AS folio, c.fecha, c.proveedor,
                c.iva, c.total, u.usuario
         FROM compras c
         JOIN usuarios u ON u.id = c.usuario_id
         WHERE c.fecha BETWEEN $1 AND $2
         ORDER BY c.fecha DESC`,
        [inicio, fin]
    );

    return result.rows;
};

// Detalles de una compra
export const detallesCompra = async (compraId) => {
    const result = await pool.query(
        `SELECT cd.cantidad, cd.costo, i.nombre
         FROM compras_det cd
         JOIN items i ON i.id = cd.item_id
         WHERE cd.compra_id = $1`,
        [compraId]
    );

    return result.rows;
};
