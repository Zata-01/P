import { pool } from "../config/db.js";

//
// GET /productos   (búsqueda, paginación, miniatura)
//
export const getProductos = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const offset = (page - 1) * limit;

    const like = `%${q}%`;
    const whereClause = `
      WHERE (i.nombre ILIKE $1 OR i.codigo_barras ILIKE $1 OR CAST(i.id AS TEXT) ILIKE $1)
        AND (i.estado = 'activo')
    `;

    const countSql = `
      SELECT COUNT(i.id) AS total_items
      FROM items i
      ${whereClause}
    `;

    const countResult = await pool.query(countSql, [like]);
    const totalItems = parseInt(countResult.rows[0].total_items, 10);

    const sql = `
      SELECT 
        i.id,
        i.codigo_barras,
        i.nombre,
        i.descripcion,
        i.precio,
        i.estado,
        COALESCE(e.stock, 0) AS existencia,
        (SELECT imagen FROM imagenes_item WHERE item_id = i.id ORDER BY id DESC LIMIT 1) AS imagen
      FROM items i
      LEFT JOIN existencias e ON e.item_id = i.id
      ${whereClause}
      ORDER BY i.id
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(sql, [like, limit, offset]);

    const rows = result.rows.map(r => ({
      ...r,
      imagen: r.imagen ? Buffer.from(r.imagen).toString("base64") : null
    }));

    return res.json({
      page,
      limit,
      totalItems,
      items: rows
    });

  } catch (error) {
    console.error("getProductos error:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


//
// GET /productos/:id
//
export const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    // Incluye codigo_barras, stock_minimo y usa existencias.stock
    const sql = `
      SELECT 
        i.id,
        i.codigo_barras,
        i.nombre,
        i.descripcion,
        i.precio,
        i.estado,
        COALESCE(e.stock, 0) AS existencia
      FROM items i
      LEFT JOIN existencias e ON e.item_id = i.id
      WHERE i.id = $1
    `;

    const { rows } = await pool.query(sql, [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Producto no encontrado" });

    const producto = rows[0];

    // obtener todas las imágenes
    const imgs = await pool.query(
      "SELECT id, imagen FROM imagenes_item WHERE item_id = $1 ORDER BY id DESC",
      [id]
    );

    producto.imagenes = imgs.rows.map(r => ({
      id: r.id,
      imagen: r.imagen ? Buffer.from(r.imagen).toString("base64") : null
    }));

    return res.json(producto);

  } catch (error) {
    console.error("getProductoById error:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


//
// POST /productos
//
export const addProduct = async (req, res) => {
  const client = await pool.connect();
  try {
    const { nombre, descripcion, precio, estado, imagenBase64, codigo_barras, stock_minimo } = req.body; 

    if (!nombre || !precio || !codigo_barras) {
      return res.status(400).json({ message: "El Nombre, Código de Barras y precio son obligatorios" });
    }

    const imagenBuffer = imagenBase64
      ? Buffer.from(imagenBase64, "base64")
      : null;

    await client.query("BEGIN");

    // Check for unique codigo_barras
    const checkBarcodeSql = "SELECT id FROM items WHERE codigo_barras = $1";
    const checkBarcode = await client.query(checkBarcodeSql, [codigo_barras]);
    if (checkBarcode.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "El Código de Barras ya existe" });
    }

    // Insertar en items (incluye codigo_barras, stock_minimo)
    const insertItemSql = `
      INSERT INTO items (nombre, descripcion, precio, estado, codigo_barras)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const r = await client.query(insertItemSql, [
      nombre,
      descripcion || null,
      parseFloat(precio),
      estado || "activo", 
      codigo_barras
    ]);

    const itemId = r.rows[0].id;

    // Insertar imagen si viene
    if (imagenBuffer) {
      await client.query(
        "INSERT INTO imagenes_item (item_id, imagen) VALUES ($1, $2)",
        [itemId, imagenBuffer]
      );
    }

    // Crear existencias = 0 (usa columna 'stock')
    await client.query(
      "INSERT INTO existencias (item_id, stock) VALUES ($1, 0)",
      [itemId]
    );

    await client.query("COMMIT");
    return res.status(201).json({
      message: "Producto creado con éxito",
      id: itemId
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("addProduct error:", error);
    return res.status(500).json({ message: "Error al crear producto" });
  } finally {
    client.release();
  }
};


//
// PUT /productos/:id
//
export const updateProduct = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const { nombre, descripcion, precio, estado, imagenBase64, codigo_barras, stock_minimo } = req.body;

    const check = await client.query("SELECT id FROM items WHERE id = $1", [id]);
    if (check.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const imagenBuffer = imagenBase64
      ? Buffer.from(imagenBase64, "base64")
      : null;

    await client.query("BEGIN");
    if (imagenBuffer) {
      await client.query(
        "DELETE FROM imagenes_item WHERE item_id = $1",
        [id]
      );
      
      await client.query(
        "INSERT INTO imagenes_item (item_id, imagen) VALUES ($1, $2)",
        [id, imagenBuffer]
      );
    }

    await client.query("COMMIT");
    return res.json({ message: "Producto actualizado" });

    // Check for unique codigo_barras if provided and changed
    if (codigo_barras !== undefined) {
        const checkBarcodeSql = "SELECT id FROM items WHERE codigo_barras = $1 AND id != $2";
        const checkBarcode = await client.query(checkBarcodeSql, [codigo_barras, id]);
        if (checkBarcode.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "El Código de Barras ya existe" });
        }
    }

    // actualizar campos del producto
    const fields = [];
    const values = [];
    let idx = 1;

    if (nombre !== undefined) { fields.push(`nombre = $${idx++}`); values.push(nombre); }
    if (descripcion !== undefined) { fields.push(`descripcion = $${idx++}`); values.push(descripcion); }
    if (precio !== undefined) { fields.push(`precio = $${idx++}`); values.push(parseFloat(precio)); }
    if (estado !== undefined) { fields.push(`estado = $${idx++}`); values.push(estado); }
    if (codigo_barras !== undefined) { fields.push(`codigo_barras = $${idx++}`); values.push(codigo_barras); }


    if (fields.length > 0) {
      const sql = `UPDATE items SET ${fields.join(", ")} WHERE id = $${idx}`;
      values.push(id);
      await client.query(sql, values);
    }

    // insertar nueva imagen (opcional)
    if (imagenBuffer) {
      await client.query(
        "INSERT INTO imagenes_item (item_id, imagen) VALUES ($1, $2)",
        [id, imagenBuffer]
      );
    }

    await client.query("COMMIT");
    return res.json({ message: "Producto actualizado" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("updateProduct error:", error);
    return res.status(500).json({ message: "Error al actualizar producto" });
  } finally {
    client.release();
  }
};


//
// DELETE /productos/:id
//
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    // Cambia el estado a 'agotado' para "eliminarlo" lógicamente
    const sql = `UPDATE items SET estado = 'agotado' WHERE id = $1`; 
    const r = await pool.query(sql, [id]);

    if (r.rowCount === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.json({ message: "Producto marcado como AGOTADO" });

  } catch (error) {
    console.error("deleteProduct error:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};