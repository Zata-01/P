import { pool } from "../db.js";


 
export const buscarProductos = async (like, limit, offset) => {
  const sql = `
    SELECT 
      i.id,
      i.nombre,
      i.descripcion,
      i.precio,
      i.estado,
      COALESCE(e.cantidad, 0) AS existencia,
      (SELECT imagen FROM imagenes_item WHERE item_id = i.id LIMIT 1) AS imagen
    FROM items i
    LEFT JOIN existencias e ON e.item_id = i.id
    WHERE (i.nombre ILIKE $1 OR CAST(i.id AS TEXT) ILIKE $1)
      AND (i.estado IS NULL OR i.estado = 'ACTIVO')
    ORDER BY i.id
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(sql, [like, limit, offset]);
  return result.rows;
};



 
export const obtenerProductoPorId = async (id) => {
  const sql = `
    SELECT 
      i.id,
      i.nombre,
      i.descripcion,
      i.precio,
      i.estado,
      COALESCE(e.cantidad, 0) AS existencia
    FROM items i
    LEFT JOIN existencias e ON e.item_id = i.id
    WHERE i.id = $1
  `;
  const result = await pool.query(sql, [id]);
  return result.rows[0] || null;
};



export const obtenerImagenesProducto = async (id) => {
  const sql = `SELECT id, imagen FROM imagenes_item WHERE item_id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rows;
};




export const insertarProducto = async (client, { nombre, descripcion, precio, estado }) => {
  const sql = `
    INSERT INTO items (nombre, descripcion, precio, estado)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const result = await client.query(sql, [
    nombre,
    descripcion || null,
    parseFloat(precio),
    estado || "ACTIVO"
  ]);
  return result.rows[0].id;
};


export const insertarImagen = async (client, itemId, buffer) => {
  await client.query(
    "INSERT INTO imagenes_item (item_id, imagen) VALUES ($1, $2)",
    [itemId, buffer]
  );
};



export const crearExistencia = async (client, itemId) => {
  await client.query(
    "INSERT INTO existencias (item_id, cantidad) VALUES ($1, 0)",
    [itemId]
  );
};


export const existeProducto = async (id) => {
  const sql = "SELECT id FROM items WHERE id = $1";
  const result = await pool.query(sql, [id]);
  return result.rows.length > 0;
};


export const actualizarProducto = async (client, id, fields) => {
  const columnas = [];
  const valores = [];
  let idx = 1;

  if (fields.nombre !== undefined) { columnas.push(`nombre = $${idx++}`); valores.push(fields.nombre); }
  if (fields.descripcion !== undefined) { columnas.push(`descripcion = $${idx++}`); valores.push(fields.descripcion); }
  if (fields.precio !== undefined) { columnas.push(`precio = $${idx++}`); valores.push(parseFloat(fields.precio)); }
  if (fields.estado !== undefined) { columnas.push(`estado = $${idx++}`); valores.push(fields.estado); }

  if (columnas.length === 0) return;

  const sql = `UPDATE items SET ${columnas.join(", ")} WHERE id = $${idx}`;
  valores.push(id);

  await client.query(sql, valores);
};





export const desactivarProducto = async (id) => {
  const sql = `UPDATE items SET estado = 'INACTIVO' WHERE id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rowCount;
};
