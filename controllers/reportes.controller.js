import { pool } from "../config/db.js";

export const getInventarioReport = async (req, res) => {
    try {
        const sql = `
            SELECT i.codigo_barras, i.nombre, i.precio, COALESCE(e.stock, 0) as stock, i.estado
            FROM items i
            LEFT JOIN existencias e ON i.id = e.item_id
            ORDER BY i.nombre ASC
        `;
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const getVentasPorFechas = async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        const sql = `
            SELECT v.id, v.fecha, u.usuario as cajero, v.subtotal, v.iva, v.total
            FROM ventas v
            JOIN usuarios u ON v.usuario_id = u.id
            WHERE v.fecha::date BETWEEN $1 AND $2
            ORDER BY v.fecha DESC
        `;
        const result = await pool.query(sql, [inicio, fin]);
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const getComprasPorFechas = async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        const sql = `
            SELECT c.id, c.fecha, c.proveedor, c.total
            FROM compras c
            WHERE c.fecha::date BETWEEN $1 AND $2
            ORDER BY c.fecha DESC
        `;
        const result = await pool.query(sql, [inicio, fin]);
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const getDevolucionesReport = async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        const sql = `
            SELECT d.fecha, d.venta_id as folio, i.codigo_barras, i.nombre, d.cantidad, d.motivo
            FROM devoluciones_venta d
            JOIN items i ON d.item_id = i.id
            WHERE d.fecha::date BETWEEN $1 AND $2
            ORDER BY d.fecha DESC
        `;
        const result = await pool.query(sql, [inicio, fin]);
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const getProductosMasVendidos = async(req, res) => res.json([]);
export const getExistenciasActuales = async(req, res) => res.json([]);
export const getVentasPorUsuario = async(req, res) => res.json([]);
export const getTotalVendido = async(req, res) => res.json({});