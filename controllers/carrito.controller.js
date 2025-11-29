export const getCart = (req, res) =>{
    if(!req.session.carrito) req.session.carrito = [];
    res.json(req.session.carrito);
};

export const addToCart = (req,res) =>{
    const item = req.body

    if(!req.session.carrito){
        req.session.carrito = [];
    }

    const index = req.session.carrito.findIndex(p => p.id === item.id); //Busca si el producto ya esta en el carrito

    if(index !== -1){//Si existe el producto, aumenta la cant
        req.session.carrito[index].cantidad++;

    }else{
        req.session.carrito.push({...item, cantidad: 1});
    }
    res.json(req.session.carrito)
};

export const clearCart = (req, res) => {
    req.session.carrito = [];
    res.json({ message: "Carrito Vaciado"})
}