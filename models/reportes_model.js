import { pool } from "../config/db.js";

// VENTAS por rango de fechas
export const ventasPorFecha = async (inicio, fin) => {
    const result = await pool.query(
        `SELECT *
         FROM ventas
         WHERE fecha BETWEEN $1 AND $2
         ORDER BY fecha ASC`,
        [inicio, fin]
    );
    return result.rows;
};

// COMPRAS por rango de fechas
export const comprasPorFecha = async (inicio, fin) => {
    const result = await pool.query(
        `SELECT *
         FROM compras
         WHERE fecha BETWEEN $1 AND $2
         ORDER BY fecha ASC`,
        [inicio, fin]
    );
    return result.rows;
};

// PRODUCTOS más vendidos
export const productosMasVendidos = async () => {
    const result = await pool.query(
        `SELECT p.nombre, SUM(vd.cantidad) AS total_vendido
         FROM ventas_det vd
         INNER JOIN productos p ON vd.item_id = p.id
         GROUP BY p.nombre
         ORDER BY total_vendido DESC`
    );
    return result.rows;
};

// EXISTENCIAS actuales
export const existenciasActuales = async () => {
    const result = await pool.query(
        `SELECT p.nombre, e.cantidad
         FROM existencias e
         INNER JOIN productos p ON p.id = e.item_id
         ORDER BY p.nombre ASC`
    );
    return result.rows;
};

// VENTAS por usuario
export const ventasPorUsuario = async (usuario_id) => {
    const result = await pool.query(
        `SELECT *
         FROM ventas
         WHERE usuario_id = $1
         ORDER BY fecha DESC`,
        [usuario_id]
    );
    return result.rows;
};

// TOTAL vendido en un rango
export const totalVendido = async (inicio, fin) => {
    const result = await pool.query(
        `SELECT SUM(total) AS total_vendido
         FROM ventas
         WHERE fecha BETWEEN $1 AND $2`,
        [inicio, fin]
    );
    return result.rows[0];
};
