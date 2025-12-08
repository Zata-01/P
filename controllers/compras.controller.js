import { pool } from "../db.js";

const IVA_FIJO = 0.16; // IVA del 16% fijo

//obtener todas las compras
export const getCompras = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.fecha,
        c.proveedor,
        c.usuario_id,
        c.iva,
        c.total
      FROM compras c
      ORDER BY c.id DESC
    `);

    return res.json(result.rows);

  } catch (error) {
    console.error("Error al obtener compras:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// obtener compra por ID, incluye "detalles"
export const getComprasById = async (req, res) => {
  try {
    const { id } = req.params;

    const compra = await pool.query(
      "SELECT * FROM compras WHERE id = $1",
      [id]
    );

    if (compra.rows.length === 0)
      return res.status(404).json({ message: "Compra no encontrada" });

    const detalles = await pool.query(
      `
      SELECT cd.id, cd.item_id, i.nombre, cd.cantidad, cd.costo
      FROM compras_det cd
      INNER JOIN items i ON i.id = cd.item_id
      WHERE cd.compra_id = $1
      `,
      [id]
    );

    return res.json({
      compra: compra.rows[0],
      detalles: detalles.rows
    });

  } catch (error) {
    console.error("Error al obtener compra por ID:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// crear compra(suponiendo que es una transacción completa)
export const createCompra = async (req, res) => {
  const client = await pool.connect();

  try {
    const { proveedor, usuario_id, productos } = req.body;

    if (!proveedor || !usuario_id || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        message: "Proveedor, usuario_id y productos son obligatorios, favor de llenar todos los campos"
      });
    }

    // Validar formato de productos
    for (const p of productos) {
      if (!p.item_id || !p.cantidad || !p.costo) {
        return res.status(400).json({
          message: "Cada producto debe incluir item_id, cantidad y costo"
        });
      }
    }

    await client.query("BEGIN");

    const fecha = new Date();

    // Registrar compra (sin total todavía)
    const result = await client.query(
      `
      INSERT INTO compras (fecha, proveedor, usuario_id, iva, total)
      VALUES ($1, $2, $3, $4, 0)
      RETURNING id
      `,
      [fecha, proveedor, usuario_id, IVA_FIJO]
    );

    const compraId = result.rows[0].id;

    let totalBase = 0;

    //Insertar detalles y actualizar existencias
    for (const p of productos) {
      const subtotal = p.cantidad * p.costo;
      totalBase += subtotal;

      await client.query(
        `
        INSERT INTO compras_det (compra_id, item_id, cantidad, costo)
        VALUES ($1, $2, $3, $4)
        `,
        [compraId, p.item_id, p.cantidad, p.costo]
      );

      // Actualizar existencias
      await client.query(
        `
        UPDATE existencias
        SET cantidad = cantidad + $1
        WHERE item_id = $2
        `,
        [p.cantidad, p.item_id]
      );
    }

    //Calcular total con IVA
    const totalFinal = totalBase * (1 + IVA_FIJO);

    //Actualizar compra con total
    await client.query(
      `
      UPDATE compras
      SET total = $1
      WHERE id = $2
      `,
      [totalFinal, compraId]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Compra registrada correctamente",
      compra_id: compraId,
      total_sin_iva: totalBase,
      iva: IVA_FIJO,
      total_con_iva: totalFinal
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear compra:", error);
    return res.status(500).json({ message: "Error al registrar la compra" });
  } finally {
    client.release();
  }
};

// Anula compra, reversión de existencias
export const deleteCompra = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    // Verificar si existe
    const compra = await client.query(
      "SELECT * FROM compras WHERE id = $1",
      [id]
    );

    if (compra.rows.length === 0)
      return res.status(404).json({ message: "Compra no encontrada" });

    await client.query("BEGIN");

    // Obtener detalles para revertir existencias
    const detalles = await client.query(
      "SELECT item_id, cantidad FROM compras_det WHERE compra_id = $1",
      [id]
    );

    for (const d of detalles.rows) {
      await client.query(
        `
        UPDATE existencias
        SET cantidad = cantidad - $1
        WHERE item_id = $2
        `,
        [d.cantidad, d.item_id]
      );
    }

    // Anular compra (NO borrar)
    await client.query(
      `
      UPDATE compras
      SET total = 0, iva = 0, proveedor = proveedor || ' (ANULADA)'
      WHERE id = $1
      `,
      [id]
    );

    await client.query("COMMIT");

    return res.json({ message: "Compra anulada correctamente" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al anular compra:", error);
    return res.status(500).json({ message: "Error al anular compra" });
  } finally {
    client.release();
  }
};
