// Obtener carrito
export const getCart = (req, res) => {
  if (!req.session.carrito) req.session.carrito = [];
  return res.json(req.session.carrito);
};

// Agregar al carrito
export const addToCart = (req, res) => {
  const item = req.body;

  if (!item.id || !item.nombre || !item.precio) {
    return res.status(400).json({
      message: "El producto debe incluir id, nombre y precio."
    });
  }

  if (!req.session.carrito) req.session.carrito = [];

  const index = req.session.carrito.findIndex(p => p.id === item.id);

  if (index !== -1) {
    req.session.carrito[index].cantidad++;
  } else {
    req.session.carrito.push({ ...item, cantidad: 1 });
  }

  return res.json(req.session.carrito);
};

// Vaciar carrito
export const clearCart = (req, res) => {
  req.session.carrito = [];
  return res.json({ message: "Carrito vaciado" });
};
