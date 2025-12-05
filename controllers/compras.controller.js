import {pool} from "../db.js"

export const getCompras = async (req, res) =>{
    try{
        const result = await pool.query("SELECT * FROM compras order by id");
        return res.json(result.rows);

    }catch(error){
        console.error("Error al Obtener las compras: ", error)
        return res.status(500).json(
            {
                message: "Error interno del server"
            }
        );

    }
}

export const getComprasById = (req, res) =>{
    try{
        const {id} = req.params;
        const result = await.pool.query("SELECT * FROM compras where id = $1", [id]);
        if(result.rows.length === 0){
            return res.status(404).json({
                message: "Compra no encontrada"
            });
        }
        return res.json(result.rows[0]);
    }catch(error){
        console.error("Error al encontrar la compra por ID", error);
        return res.status(500).json({
            message: "Error interno del server"
        });

    }
}

/*QUEDAN OENDIENTE LOS SIG MÉTODOS:
export const createCompra
export const updateCompra
export const deleteCompra
*/
