import { pool } from "../db.js";

// Obtener todas las ventas
export const getVentas = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM ventas ORDER BY id DESC");
        return res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener ventas:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Obtener venta por ID, incluyendo los detalles
export const getVentaById = async (req, res) => {
    try {
        const { id } = req.params;

        // Venta
        const venta = await pool.query("SELECT * FROM ventas WHERE id = $1", [id]);
        if (venta.rows.length === 0) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        // Detalles
        const detalles = await pool.query(
            `SELECT vd.*, p.nombre AS nombre_producto 
             FROM ventas_det vd
             JOIN productos p ON p.id = vd.item_id
             WHERE vd.venta_id = $1`,
            [id]
        );

        return res.json({
            venta: venta.rows[0],
            detalles: detalles.rows
        });

    } catch (error) {
        console.error("Error al obtener venta por ID:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// crear venta(post), usa el carriito)
export const createVenta = async (req, res) => {
    const client = await pool.connect();

    try {
        const { usuario_id, productos } = req.body;

        // Validar datos obligatorios
        if (!usuario_id || !productos || productos.length === 0) {
            return res.status(400).json({ message: "Datos incompletos" });
        }

        // Calcular subtotal
        let subtotal = 0;
        productos.forEach(p => {
            subtotal += p.cantidad * p.precio;
        });

        const iva = 0.16;                     
        const total = subtotal * (1 + iva);     // Total final

        await client.query("BEGIN");

        // Insertar venta
        const venta = await client.query(
            `INSERT INTO ventas (fecha, usuario_id, subtotal, iva, total)
             VALUES (NOW(), $1, $2, $3, $4)
             RETURNING id`,
            [usuario_id, subtotal, iva, total]
        );

        const venta_id = venta.rows[0].id;

        // Insertar detalles y modificar existencias
        for (const item of productos) {

            // Verificar existencias
            const stock = await client.query(
                "SELECT cantidad FROM existencias WHERE item_id = $1",
                [item.id]
            );

            if (stock.rows.length === 0 || stock.rows[0].cantidad < item.cantidad) {
                throw new Error(`Stock insuficiente para el producto ID ${item.id}`);
            }

            // Insertar detalle
            await client.query(
                `INSERT INTO ventas_det (venta_id, item_id, cantidad, precio)
                 VALUES ($1, $2, $3, $4)`,
                [venta_id, item.id, item.cantidad, item.precio]
            );

            // Restar existencias
            await client.query(
                `UPDATE existencias
                 SET cantidad = cantidad - $1
                 WHERE item_id = $2`,
                [item.cantidad, item.id]
            );
        }

        await client.query("COMMIT");

        // Esta es la respuesta de la venta, se utilizará para la lo del ticket(FIDEL), devuelve todos los detalles de la venta
        return res.json({
            venta_id,
            fecha: new Date(),
            usuario_id,
            productos,
            subtotal,
            iva,
            total
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al crear venta:", error);
        return res.status(500).json({ message: "Error al crear venta", error: error.message });

    } finally {
        client.release();
    }
};

// ------------------------------------------
// Cancela la venta y regresa las existencias
export const deleteVenta = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        await client.query("BEGIN");

        const detalles = await client.query(
            "SELECT * FROM ventas_det WHERE venta_id = $1",
            [id]
        );

        if (detalles.rows.length === 0) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        // Regresar existencias que había en el inventario
        for (const item of detalles.rows) {
            await client.query(
                `UPDATE existencias
                 SET cantidad = cantidad + $1
                 WHERE item_id = $2`,
                [item.cantidad, item.item_id]
            );
        }

        // Borrar detalles 
        await client.query("DELETE FROM ventas_det WHERE venta_id = $1", [id]);

        // Borrar venta
        await client.query("DELETE FROM ventas WHERE id = $1", [id]);

        await client.query("COMMIT");

        return res.json({ message: "Venta anulada correctamente" });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al anular venta:", error);
        return res.status(500).json({ message: "Error al anular venta" });

    } finally {
        client.release();
    }
};
