// ... (El resto del código: buscarTicket, registrarDevolucion se mantiene igual) ...

let ventaActual = null;

const inputBuscarDev = document.getElementById("buscarTicket"); 
if (inputBuscarDev) {
    inputBuscarDev.addEventListener("input", (e) => {
        const termino = e.target.value;
        cargarDevoluciones(termino);
    });
}

async function buscarTicket() {
    const folioInput = document.getElementById("numeroTicket").value.trim();
    if (!folioInput) return alert("Ingrese un folio");

    try {
        const res = await fetch(`/api/ventas/${folioInput}`);
        if (!res.ok) throw new Error("Venta no encontrada");
        
        const data = await res.json();
        ventaActual = data;
        
        document.getElementById("ticketInfo").style.display = "block";
        const select = document.getElementById("productoDevolucion");
        select.innerHTML = '<option value="">Seleccione producto</option>';
        
        data.detalles.forEach(d => {
            const opt = document.createElement("option");
            opt.value = d.item_id;
            opt.innerText = `${d.nombre} (Vendidos: ${d.cantidad})`;
            opt.dataset.max = d.cantidad;
            select.appendChild(opt);
        });
        
        document.getElementById("btnRegistrarDevolucion").disabled = false;

    } catch (error) {
        alert(error.message);
        document.getElementById("ticketInfo").style.display = "none";
    }
}

async function registrarDevolucion(e) {
    e.preventDefault();
    if(!ventaActual) return;

    const item_id = document.getElementById("productoDevolucion").value;
    const cantidad = document.getElementById("cantidadDevolucion").value;
    const motivo = document.getElementById("motivoDevolucion").value;

    const payload = {
        venta_id: ventaActual.venta.id,
        items: [{ item_id, cantidad }],
        motivo
    };

    try {
        const res = await fetch('/api/devoluciones', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if(!res.ok) throw new Error(data.message);
        
        alert("Devolución registrada");
        document.getElementById("modalDevolucion").classList.remove("active");
        
        cargarDevoluciones();

    } catch (error) {
        alert("Error: " + error.message);
    }
}

// 4. Cargar la lista de devoluciones (Tabla CORREGIDA)
async function cargarDevoluciones(q = '') {
    try {
        const query = (typeof q === 'string') ? q : ''; 
        const url = query ? `/api/devoluciones?q=${encodeURIComponent(query)}` : '/api/devoluciones';
        
        const res = await fetch(url);
        const data = await res.json();
        const tbody = document.getElementById("devolucionesTableBody");
        tbody.innerHTML = "";
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No se encontraron devoluciones</td></tr>';
            return;
        }

        data.forEach(d => {
            const tr = document.createElement("tr");
            
            // CORRECCIÓN AQUÍ: Usar d.monto_devuelto
            const monto = parseFloat(d.monto_devuelto || 0).toFixed(2);

            tr.innerHTML = `
                <td>#${d.id}</td>
                <td>V-${d.folio_venta ? d.folio_venta.toString().padStart(6, '0') : '???'}</td>
                <td>${d.producto}</td>
                <td>${d.cantidad}</td>
                <td style="font-weight:bold; color:#d32f2f;">$${monto}</td>
                <td>${d.motivo}</td>
                <td>${new Date(d.fecha).toLocaleDateString("es-MX")}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error cargando devoluciones:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarDevoluciones();
});

window.buscarTicket = buscarTicket;
window.registrarDevolucion = registrarDevolucion;
window.abrirModalDevolucion = () => document.getElementById("modalDevolucion").classList.add("active");
window.cerrarModalDevolucion = () => document.getElementById("modalDevolucion").classList.remove("active");