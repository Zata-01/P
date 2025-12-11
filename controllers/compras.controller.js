import { pool } from "../config/db.js";

export const createCompra = async (req, res) => {
    const client = await pool.connect();
    try {
        const { proveedor, detalles, total } = req.body;
        const usuario_id = req.session.user.id;

        await client.query("BEGIN");

        const iva = total * 0.16;
        const compraRes = await client.query(
            "INSERT INTO compras (fecha, proveedor, usuario_id, iva, total) VALUES (NOW(), $1, $2, $3, $4) RETURNING id",
            [proveedor, usuario_id, iva, total]
        );
        const compraId = compraRes.rows[0].id;

        for (const d of detalles) {
            await client.query(
                "INSERT INTO compras_det (compra_id, item_id, cantidad, costo) VALUES ($1, $2, $3, $4)",
                [compraId, d.item_id, d.cantidad, d.costo]
            );
            const check = await client.query("SELECT item_id FROM existencias WHERE item_id = $1", [d.item_id]);
            if (check.rows.length === 0) {
                await client.query("INSERT INTO existencias (item_id, stock) VALUES ($1, $2)", [d.item_id, d.cantidad]);
            } else {
                await client.query("UPDATE existencias SET stock = stock + $1 WHERE item_id = $2", [d.cantidad, d.item_id]);
            }
        }

        await client.query("COMMIT");
        res.json({ message: "Compra registrada correctamente" });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ message: "Error al registrar compra" });
    } finally {
        client.release();
    }
};

export const getCompras = async (req, res) => {
    try {
        const { q } = req.query;
        let sql = `
            SELECT c.id, c.fecha, c.proveedor, i.nombre as producto, cd.cantidad, cd.costo, (cd.cantidad * cd.costo) as total_linea
            FROM compras c
            JOIN compras_det cd ON c.id = cd.compra_id
            JOIN items i ON cd.item_id = i.id
        `;
        
        const params = [];
        if (q) {
            sql += ` WHERE c.proveedor ILIKE $1 OR i.nombre ILIKE $1 OR CAST(c.id AS TEXT) ILIKE $1`;
            params.push(`%${q}%`);
        }

        sql += ` ORDER BY c.fecha ASC LIMIT 50`;

        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

export const getComprasById = async (req, res) => {};
export const deleteCompra = async (req, res) => {};