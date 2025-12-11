let listaCompra = [];
let productosCache = [];

document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch('/api/productos?limit=100');
    const data = await res.json();
    productosCache = data.items;
    
    const select = document.getElementById("productoCompra");
    productosCache.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.innerText = p.nombre;
        select.appendChild(opt);
    });
    
    cargarHistorialCompras();
});

function registrarCompra(e) {
    e.preventDefault();
    const item_id = document.getElementById("productoCompra").value;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const costo = parseFloat(document.getElementById("precioUnitario").value);
    const proveedor = document.getElementById("proveedor").value;

    if(!item_id || !cantidad || !costo) return;

    const compraData = {
        proveedor,
        total: cantidad * costo,
        detalles: [{ item_id, cantidad, costo }]
    };

    fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compraData)
    })
    .then(r => r.json())
    .then(data => {
        alert(data.message);
        document.getElementById("modalCompra").classList.remove("active");
        cargarHistorialCompras();
    })
    .catch(err => alert("Error al registrar compra"));
}

const inputBuscar = document.getElementById("buscarProducto");
if (inputBuscar) {
    inputBuscar.addEventListener("input", (e) => {
        const termino = e.target.value;
        cargarHistorialCompras(termino);
    });
}

async function cargarHistorialCompras(q = '') {
    try {
        // Enviar parámetro q a la API
        const url = q ? `/api/compras?q=${encodeURIComponent(q)}` : '/api/compras';
        const res = await fetch(url);
        const data = await res.json();
        
        const tbody = document.getElementById("comprasTableBody");
        tbody.innerHTML = "";
        
        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No se encontraron resultados</td></tr>';
            return;
        }

        data.forEach(c => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>#${c.id.toString().padStart(4, '0')}</td>
                <td>${c.proveedor}</td>
                <td>${c.producto}</td>
                <td>${c.cantidad}</td>
                <td>$${parseFloat(c.costo).toFixed(2)}</td>
                <td>$${parseFloat(c.total_linea).toFixed(2)}</td>
                <td>${new Date(c.fecha).toLocaleDateString("es-MX")}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error cargando compras:", error);
    }
}

window.registrarCompra = registrarCompra;
window.abrirModalRegistrarCompra = () => document.getElementById("modalCompra").classList.add("active");
window.cerrarModalCompra = () => document.getElementById("modalCompra").classList.remove("active");