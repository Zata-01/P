import { pool } from "../config/db.js";

export const createDevolucion = async (req, res) => {
    const client = await pool.connect();
    try {
        const { venta_id, items, motivo } = req.body; 

        await client.query("BEGIN");

        for (const item of items) {
            const ventaDet = await client.query(
                "SELECT cantidad FROM ventas_det WHERE venta_id = $1 AND item_id = $2",
                [venta_id, item.item_id]
            );
            
            if (ventaDet.rows.length === 0) throw new Error(`Producto ID ${item.item_id} no pertenece a esta venta`);
            const vendido = ventaDet.rows[0].cantidad;

            const prevDev = await client.query(
                "SELECT SUM(cantidad) as total FROM devoluciones_venta WHERE venta_id = $1 AND item_id = $2",
                [venta_id, item.item_id]
            );
            const devueltoPrev = parseInt(prevDev.rows[0].total || 0);

            if ((devueltoPrev + parseInt(item.cantidad)) > vendido) {
                throw new Error(`No se puede devolver más de lo vendido. Vendido: ${vendido}, Previo: ${devueltoPrev}`);
            }

            await client.query(
                "INSERT INTO devoluciones_venta (venta_id, item_id, cantidad, motivo, fecha) VALUES ($1, $2, $3, $4, NOW())",
                [venta_id, item.item_id, item.cantidad, motivo]
            );

            await client.query(
                "UPDATE existencias SET stock = stock + $1 WHERE item_id = $2",
                [item.cantidad, item.item_id]
            );
        }

        await client.query("COMMIT");
        res.json({ message: "Devolución procesada exitosamente" });

    } catch (error) {
        await client.query("ROLLBACK");
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
};
export const getDevoluciones = async (req, res) => {
    try {
        const { q } = req.query;
        
        let sql = `
            SELECT 
                d.*, 
                i.nombre as producto, 
                v.id as folio_venta,
                (d.cantidad * vd.precio_unidad) as monto_devuelto
            FROM devoluciones_venta d
            JOIN items i ON d.item_id = i.id
            JOIN ventas v ON d.venta_id = v.id
            JOIN ventas_det vd ON (d.venta_id = vd.venta_id AND d.item_id = vd.item_id)
        `;

        const params = [];
        if (q) {
            sql += ` WHERE CAST(v.id AS TEXT) ILIKE $1 OR i.nombre ILIKE $1 OR d.motivo ILIKE $1`;
            params.push(`%${q}%`);
        }

        sql += ` ORDER BY d.fecha DESC LIMIT 50`;

        const r = await pool.query(sql, params);
        res.json(r.rows);
    } catch (e) { 
        console.error(e);
        res.status(500).json({message: e.message}); 
    }
};

export const getDevolucionById = async (req, res) => {};
export const deleteDevolucion = async (req, res) => {};