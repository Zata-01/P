import { pool } from "../db.js";


// Obtener todas las devoluciones
export const getAllDevoluciones = async () => {
    const result = await pool.query(
        `SELECT * FROM devoluciones ORDER BY id DESC`
    );
    return result.rows;
};

// Obtener una devolución por ID
export const getDevolucion = async (id) => {
    const result = await pool.query(
        `SELECT * FROM devoluciones WHERE id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

// Obtener detalles de una devolución
export const getDevolucionDetalles = async (id) => {
    const result = await pool.query(
        `SELECT dd.*, p.nombre AS nombre_producto
         FROM devoluciones_det dd
         JOIN productos p ON p.id = dd.item_id
         WHERE dd.devolucion_id = $1`,
        [id]
    );
    return result.rows;
};


// Verificar si una venta existe
export const getVenta = async (ventaId) => {
    const result = await pool.query(
        `SELECT * FROM ventas WHERE id = $1`,
        [ventaId]
    );
    return result.rows[0] || null;
};

// Obtener la cantidad vendida de un producto específico
export const getCantidadVendida = async (ventaId, itemId) => {
    const result = await pool.query(
        `SELECT cantidad
         FROM ventas_det
         WHERE venta_id = $1 AND item_id = $2`,
        [ventaId, itemId]
    );
    return result.rows[0] || null;
};



// Insertar cabecera de devolución
export const insertarDevolucion = async (client, ventaId, usuarioId, total) => {
    const result = await client.query(
        `INSERT INTO devoluciones (fecha, venta_id, usuario_id, total)
         VALUES (NOW(), $1, $2, $3)
         RETURNING id`,
        [ventaId, usuarioId, total]
    );
    return result.rows[0].id;
};


export const insertarDevolucionDetalle = async (client, devolucionId, item) => {
    await client.query(
        `INSERT INTO devoluciones_det (devolucion_id, item_id, cantidad, precio)
         VALUES ($1, $2, $3, $4)`,
        [devolucionId, item.item_id, item.cantidad, item.precio]
    );
};


export const actualizarExistencia = async (client, itemId, cantidad) => {
    await client.query(
        `UPDATE existencias
         SET cantidad = cantidad + $1
         WHERE item_id = $2`,
        [cantidad, itemId]
    );
};


// Obtener todos los detalles de una devolución
export const getDetallesParaEliminar = async (client, devolucionId) => {
    const result = await client.query(
        `SELECT * FROM devoluciones_det WHERE devolucion_id = $1`,
        [devolucionId]
    );
    return result.rows;
};


export const deleteDetallesDevolucion = async (client, devolucionId) => {
    await client.query(
        `DELETE FROM devoluciones_det WHERE devolucion_id = $1`,
        [devolucionId]
    );
};


export const deleteDevolucionDB = async (client, devolucionId) => {
    await client.query(
        `DELETE FROM devoluciones WHERE id = $1`,
        [devolucionId]
    );
};
