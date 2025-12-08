import { pool } from "../db.js";


//Obtener ventas por un rango de fechas
export const getVentasPorFechas = async (req, res) => {
    try {
        const { inicio, fin } = req.query;

        const result = await pool.query(
            `SELECT *
             FROM ventas
             WHERE fecha BETWEEN $1 AND $2
             ORDER BY fecha ASC`,
            [inicio, fin]
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Error en reporte de ventas por fechas:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};



// Obtener compras en un rango de fecha
export const getComprasPorFechas = async (req, res) => {
    try {
        const { inicio, fin } = req.query;

        const result = await pool.query(
            `SELECT *
             FROM compras
             WHERE fecha BETWEEN $1 AND $2
             ORDER BY fecha ASC`,
            [inicio, fin]
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Error en reporte de compras por fechas:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};



// Obtener los productos maás vendidos
export const getProductosMasVendidos = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.nombre, SUM(vd.cantidad) AS total_vendido
             FROM ventas_det vd
             INNER JOIN productos p ON vd.item_id = p.id
             GROUP BY p.nombre
             ORDER BY total_vendido DESC`
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Error en reporte de productos más vendidos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};



// Obtener existencias actuales
export const getExistenciasActuales = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.nombre, e.cantidad
             FROM existencias e
             INNER JOIN productos p ON p.id = e.item_id
             ORDER BY p.nombre ASC`
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Error en reporte de existencias:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};



// Obtener las ventas por usuario
export const getVentasPorUsuario = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM ventas
             WHERE usuario_id = $1
             ORDER BY fecha DESC`,
            [usuario_id]
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Error en reporte de ventas por usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};



// obtener el total de ventas en rango
export const getTotalVendido = async (req, res) => {
    try {
        const { inicio, fin } = req.query;

        const result = await pool.query(
            `SELECT SUM(total) AS total_vendido
             FROM ventas
             WHERE fecha BETWEEN $1 AND $2`,
            [inicio, fin]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error en reporte total vendido:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
