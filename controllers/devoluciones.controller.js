import { pool } from "../db.js";

//obtener todas las devoluciones
export const getDevoluciones = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM devoluciones ORDER BY id DESC");
        return res.json(result.rows);

    } catch (error) {
        console.error("Error al obtener devoluciones:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Obtener devoluciones por ID
export const getDevolucionById = async (req, res) => {
    try {
        const { id } = req.params;

        const devol = await pool.query("SELECT * FROM devoluciones WHERE id = $1", [id]);
        if (devol.rows.length === 0) {
            return res.status(404).json({ message: "Devolución no encontrada" });
        }

        const detalles = await pool.query(
            `SELECT dd.*, p.nombre AS nombre_producto
             FROM devoluciones_det dd
             JOIN productos p ON p.id = dd.item_id
             WHERE dd.devolucion_id = $1`,
            [id]
        );

        return res.json({
            devolucion: devol.rows[0],
            detalles: detalles.rows
        });

    } catch (error) {
        console.error("Error al obtener devolución:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// crear devolución
export const createDevolucion = async (req, res) => {
    const client = await pool.connect();

    try {
        const { venta_id, usuario_id, productos } = req.body;

        if (!venta_id || !usuario_id || !productos || productos.length === 0) {
            return res.status(400).json({ message: "Datos incompletos" });
        }

        // Validar que la venta exista
        const venta = await client.query(
            "SELECT * FROM ventas WHERE id = $1",
            [venta_id]
        );

        if (venta.rows.length === 0) {
            return res.status(404).json({ message: "La venta no existe" });
        }

        await client.query("BEGIN");

        // Calcular total devolución
        let total = 0;
        productos.forEach(p => total += p.cantidad * p.precio);

        // Insertar cabecera
        const devol = await client.query(
            `INSERT INTO devoluciones (fecha, venta_id, usuario_id, total)
             VALUES (NOW(), $1, $2, $3)
             RETURNING id`,
            [venta_id, usuario_id, total]
        );

        const devolucion_id = devol.rows[0].id;

        // Procesar cada producto devuelto
        for (const item of productos) {

            // Verificar que no se devuelva más de lo vendido
            const vendido = await client.query(
                `SELECT cantidad 
                 FROM ventas_det 
                 WHERE venta_id = $1 AND item_id = $2`,
                [venta_id, item.item_id]
            );

            if (vendido.rows.length === 0) {
                throw new Error(`El producto ID ${item.item_id} no pertenece a esta venta.`);
            }

            if (item.cantidad > vendido.rows[0].cantidad) {
                throw new Error(`No se pueden devolver más unidades de las que se vendieron.`);
            }

            // Insertar detalles
            await client.query(
                `INSERT INTO devoluciones_det (devolucion_id, item_id, cantidad, precio)
                 VALUES ($1, $2, $3, $4)`,
                [devolucion_id, item.item_id, item.cantidad, item.precio]
            );

            // Regresar existencias al inventario
            await client.query(
                `UPDATE existencias 
                 SET cantidad = cantidad + $1
                 WHERE item_id = $2`,
                [item.cantidad, item.item_id]
            );
        }

        await client.query("COMMIT");

        return res.json({
            devolucion_id,
            venta_id,
            usuario_id,
            fecha: new Date(),
            productos,
            total
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al crear devolución:", error);
        return res.status(500).json({ 
            message: "Error al crear devolución", 
            error: error.message 
        });

    } finally {
        client.release();
    }
};

// snular devolución
export const deleteDevolucion = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        await client.query("BEGIN");

        const detalles = await client.query(
            "SELECT * FROM devoluciones_det WHERE devolucion_id = $1",
            [id]
        );

        if (detalles.rows.length === 0) {
            return res.status(404).json({ message: "Devolución no encontrada" });
        }

        // revertir inventario
        for (const item of detalles.rows) {
            await client.query(
                `UPDATE existencias
                 SET cantidad = cantidad - $1
                 WHERE item_id = $2`,
                [item.cantidad, item.item_id]
            );
        }

        // Eliminar detalles
        await client.query("DELETE FROM devoluciones_det WHERE devolucion_id = $1", [id]);

        // Eliminar el registro principal de la devolución
        await client.query("DELETE FROM devoluciones WHERE id = $1", [id]);

        await client.query("COMMIT");

        return res.json({ message: "Devolución anulada correctamente" });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al anular devolución:", error);
        return res.status(500).json({ message: "Error al anular devolución" });

    } finally {
        client.release();
    }
};
