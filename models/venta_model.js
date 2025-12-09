import db from "../database/db.js";

export const reporteVentasPorFecha = async (inicio, fin) => {
    const [rows] = await db.execute(
        `SELECT v.id AS folio, v.fecha, u.usuario,
                v.subtotal, v.iva, v.total
         FROM ventas v
         JOIN usuarios u ON u.id = v.usuario_id
         WHERE v.fecha BETWEEN ? AND ?
         ORDER BY v.fecha DESC`,
        [inicio, fin]
    );
    return rows;
};

export const detallesVenta = async (ventaId) => {
    const [rows] = await db.execute(
        `SELECT vd.cantidad, vd.precio_unidad, i.nombre
         FROM ventas_det vd
         JOIN items i ON i.id = vd.item_id
         WHERE vd.venta_id = ?`,
        [ventaId]
    );
    return rows;
};