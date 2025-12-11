import { pool } from "../config/db.js";

export const getVentaById = async (req, res) => {
    try {
        const { id } = req.params;
        const ventaId = id.replace(/\D/g, ''); 

        const venta = await pool.query("SELECT * FROM ventas WHERE id = $1", [ventaId]);
        
        if (venta.rows.length === 0) return res.status(404).json({ message: "Venta no encontrada" });

        const detalles = await pool.query(`
            SELECT vd.*, i.nombre, i.codigo_barras 
            FROM ventas_det vd
            JOIN items i ON vd.item_id = i.id
            WHERE vd.venta_id = $1
        `, [ventaId]);

        res.json({
            venta: venta.rows[0],
            detalles: detalles.rows
        });
    } catch (error) {
        res.status(500).json({ message: "Error al buscar venta" });
    }
};

export const createVenta = async (req, res) => {
    const client = await pool.connect();
    try {
        const { productos } = req.body;
        const usuario_id = req.session.user.id;

        if (!productos || productos.length === 0) return res.status(400).json({ message: "Carrito vacío" });

        await client.query("BEGIN");

        let subtotal = 0;
        for (const p of productos) {
            const stockRes = await client.query(
                "SELECT stock, precio FROM existencias e JOIN items i ON e.item_id = i.id WHERE item_id = $1 FOR UPDATE", 
                [p.id]
            );
            if (stockRes.rows.length === 0 || stockRes.rows[0].stock < p.cantidad) {
                throw new Error(`Stock insuficiente para ${p.nombre}`);
            }
            subtotal += (parseFloat(stockRes.rows[0].precio) * p.cantidad);
        }

        const iva = subtotal * 0.16;
        const total = subtotal + iva;

        const ventaRes = await client.query(
            "INSERT INTO ventas (fecha, usuario_id, subtotal, iva, total) VALUES (NOW(), $1, $2, $3, $4) RETURNING id",
            [usuario_id, subtotal, iva, total]
        );
        const ventaId = ventaRes.rows[0].id;

        for (const p of productos) {
            await client.query(
                "INSERT INTO ventas_det (venta_id, item_id, cantidad, precio_unidad) VALUES ($1, $2, $3, $4)",
                [ventaId, p.id, p.cantidad, p.precio]
            );
            await client.query(
                "UPDATE existencias SET stock = stock - $1 WHERE item_id = $2",
                [p.cantidad, p.id]
            );
        }

        await client.query("COMMIT");

        res.json({
            message: "Venta exitosa",
            ticket: {
                folio: `V-${String(ventaId).padStart(6, '0')}`,
                fecha: new Date().toLocaleString(),
                cajero: req.session.user.usuario,
                productos,
                subtotal,
                iva,
                total
            }
        });

    } catch (error) {
        await client.query("ROLLBACK");
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
};

export const getVentas = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT v.id, v.fecha, i.nombre as producto, vd.cantidad, (vd.cantidad * vd.precio_unidad) as total
            FROM ventas v 
            JOIN ventas_det vd ON v.id = vd.venta_id
            JOIN items i ON vd.item_id = i.id
            ORDER BY v.fecha DESC LIMIT 50
        `);
        return res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener ventas" });
    }
};

export const deleteVenta = async (req, res) => { res.json({}) };