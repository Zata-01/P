import { pool } from "../db.js";

// obtener todas las compras
export const getCompras = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM compras ORDER BY id");
        return res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener compras:", error);
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};

// obtwnwe compras por id
export const getComprasById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM compras WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Compra no encontrada" });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al obtener compra por ID:", error);
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};

//crear compra
export const createCompra = async (req, res) => {
    const client = await pool.connect();

    try {
        const { proveedor, usuario_id, iva, total, detalles } = req.body;

        await client.query("BEGIN");

        // Insertar la COMPRA
        const compraResult = await client.query(
            `INSERT INTO compras (fecha, proveedor, usuario_id, iva, total)
             VALUES (NOW(), $1, $2, $3, $4)
             RETURNING *`,
            [proveedor, usuario_id, iva, total]
        );

        const compra = compraResult.rows[0];

        // Insertar DETALLES de la compra
        for (const item of detalles) {
            await client.query(
                `INSERT INTO compras_det (compra_id, item_id, cantidad, costo)
                 VALUES ($1, $2, $3, $4)`,
                [compra.id, item.item_id, item.cantidad, item.costo]
            );

            // Actualizar existencia
            await client.query(
                `UPDATE existencias
                 SET cantidad = cantidad + $1
                 WHERE item_id = $2`,
                [item.cantidad, item.item_id]
            );
        }

        await client.query("COMMIT");
        return res.json({ message: "Compra registrada exitosamente", compra });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al crear compra:", error);
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    } finally {
        client.release();
    }
};

//
// Eliminar una compra por id

export const deleteCompra = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        await client.query("BEGIN");

        // Obtener detalles para regresar existencias
        const detalles = await client.query(
            "SELECT * FROM compras_det WHERE compra_id = $1",
            [id]
        );

        // Regresar existencias al inventario
        for (const item of detalles.rows) {
            await client.query(
                `UPDATE existencias
                 SET cantidad = cantidad - $1
                 WHERE item_id = $2`,
                [item.cantidad, item.item_id]
            );
        }

        // Eliminar detalles
        await client.query(
            "DELETE FROM compras_det WHERE compra_id = $1",
            [id]
        );

        // Eliminar cabecera
        const result = await client.query(
            "DELETE FROM compras WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Compra no encontrada" });
        }

        await client.query("COMMIT");
        return res.json({ message: "Compra eliminada exitosamente" });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al eliminar compra:", error);
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    } finally {
        client.release();
    }
};
