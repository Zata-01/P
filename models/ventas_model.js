import { pool } from "../config/db.js";

// Obtener todas las ventas
export const obtenerVentas = async () => {
    const result = await pool.query(
        "SELECT * FROM ventas ORDER BY id DESC"
    );
    return result.rows;
};

// Obtener venta por ID (incluyendo detalles)
export const obtenerVentaPorId = async (id) => {
    const venta = await pool.query(
        "SELECT * FROM ventas WHERE id = $1",
        [id]
    );

    if (venta.rows.length === 0) return null;

    const detalles = await pool.query(
        `SELECT vd.*, p.nombre AS nombre_producto
         FROM ventas_det vd
         JOIN productos p ON p.id = vd.item_id
         WHERE vd.venta_id = $1`,
        [id]
    );

    return {
        venta: venta.rows[0],
        detalles: detalles.rows
    };
};

// Crear venta (usa carrito)
export const crearVenta = async (usuario_id, productos) => {
    const client = await pool.connect();

    try {
        let subtotal = 0;

        productos.forEach(p => {
            subtotal += p.cantidad * p.precio;
        });

        const iva = 0.16;
        const total = subtotal * (1 + iva);

        await client.query("BEGIN");

        const venta = await client.query(
            `INSERT INTO ventas (fecha, usuario_id, subtotal, iva, total)
             VALUES (NOW(), $1, $2, $3, $4)
             RETURNING id`,
            [usuario_id, subtotal, iva, total]
        );

        const venta_id = venta.rows[0].id;

        // Insertar detalles y actualizar existencias
        for (const item of productos) {
            const stock = await client.query(
                "SELECT cantidad FROM existencias WHERE item_id = $1",
                [item.id]
            );

            if (stock.rows.length === 0 || stock.rows[0].cantidad < item.cantidad) {
                throw new Error(`Stock insuficiente para el producto ID ${item.id}`);
            }

            await client.query(
                `INSERT INTO ventas_det (venta_id, item_id, cantidad, precio)
                 VALUES ($1, $2, $3, $4)`,
                [venta_id, item.id, item.cantidad, item.precio]
            );

            await client.query(
                `UPDATE existencias
                 SET cantidad = cantidad - $1
                 WHERE item_id = $2`,
                [item.cantidad, item.id]
            );
        }

        await client.query("COMMIT");

        return {
            venta_id,
            fecha: new Date(),
            usuario_id,
            productos,
            subtotal,
            iva,
            total
        };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// Cancelar venta (regresa existencias)
export const anularVenta = async (id) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const detalles = await client.query(
            "SELECT * FROM ventas_det WHERE venta_id = $1",
            [id]
        );

        if (detalles.rows.length === 0) return null;

        // Regresar existencias
        for (const item of detalles.rows) {
            await client.query(
                `UPDATE existencias
                 SET cantidad = cantidad + $1
                 WHERE item_id = $2`,
                [item.cantidad, item.item_id]
            );
        }

        await client.query("DELETE FROM ventas_det WHERE venta_id = $1", [id]);
        await client.query("DELETE FROM ventas WHERE id = $1", [id]);

        await client.query("COMMIT");

        return { message: "Venta anulada correctamente" };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};
