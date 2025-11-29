export const getProductos = (req, res) => {
  res.json([
    { id: 1, nombre: "Rolex Daytona", precio: 100 },
    { id: 2, nombre: "Cartier Crash", precio: 200 },
    { id: 3, nombre: "Seiko Ultimate", precio: 300 },
    { id: 4, nombre: "Bulova PV", precio: 400 },
    ]);
};
/*
export const addProductos
export const updateProductos
export const deleteProductos
*/ //METODOS PENDIENTES DE HACER^