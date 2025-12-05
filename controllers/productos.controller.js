export const getProductos = (req, res) => {
  res.json(productos)//regresa todos los productos, incluyendo los nuevos que se agregan
};

let productos = [ //BDD temporal
  {id:1, nombre:"Rolex Daytona", precio:100},
  { id: 2, nombre: "Cartier Crash", precio: 200 },
  { id: 3, nombre: "Seiko Ultimate", precio: 300 },
  { id: 4, nombre: "Bulova PV", precio: 400}

];

export const addProducts = (req,res) =>{
  const nuevo = { //creación del nuevo producto con lo que le envíe el cliente
    id:productos.length + 1,
    nombre: req.body.nombre,
    precio: req.body.precio
  }
  productos.push(nuevo)//se guarda el producto en el arreglo
  res.json(nuevo)//envia al cliente el producto que agrego, en este caso será el admin
}
export const updateProducts = (req, res) =>{
  const id = parseInt(req.params.id)//toma el id de la url
  const index = productos.findIndex(p => p.id ===id); //busca al posicióon del indice del producto con ese id
  if(index === -1) return res.status(404).json({message:"Producto no encontrado"});
  productos[index] = {...productos[index],...req.body};//actualiza el producto mezclando lo que ya tenia con lo  nuevo del cliente
  res.json(productos[index]) //devuelve el producto actualizado
}

export const deleteProducts = (req, res) =>{
  const id = parseInt(req.params.id)
  const index = productos.findIndex(p => p.id ===id );
  if(index=== -1)return res.status(404).json({message:"Producti no encontrado"})
    productos.splice(index, 1);
  res.json({message: "Producto eliminado correctamente"})
}
