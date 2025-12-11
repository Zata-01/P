let carrito = [];

// Elementos del DOM
const inputSearch = document.getElementById("barcodeSearch");
const resultsContainer = document.getElementById("productResults");
const cartContainer = document.getElementById("cartItems");
const btnCompletar = document.querySelector("button[onclick='completarVenta()']");

// 1. Buscador de Productos
inputSearch.addEventListener("input", async (e) => {
    const term = e.target.value.trim();
    
    if (term.length < 2) {
        resultsContainer.innerHTML = "";
        return;
    }

    try {
        resultsContainer.innerHTML = '<div style="padding:10px; color:#666;">Buscando...</div>';
        
        const res = await fetch(`/api/productos?q=${encodeURIComponent(term)}&limit=5`);
        if (!res.ok) throw new Error("Error API");
        
        const data = await res.json();
        renderResultados(data.items || []);
        
    } catch (error) {
        console.error(error);
        resultsContainer.innerHTML = '<div style="padding:10px; color:red;">Error al buscar</div>';
    }
});

// 2. Mostrar Resultados de Búsqueda
function renderResultados(productos) {
    resultsContainer.innerHTML = "";

    if (productos.length === 0) {
        resultsContainer.innerHTML = '<div style="padding:10px; color:#666;">No encontrado</div>';
        return;
    }

    productos.forEach(p => {
        const div = document.createElement("div");
        div.style.cssText = "padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; background: white;";
        
        // Colorear stock: Verde si hay, Rojo si no
        const stockColor = p.existencia > 0 ? 'green' : 'red';
        const precio = parseFloat(p.precio).toFixed(2);

        div.innerHTML = `
            <div style="font-weight:bold;">${p.nombre}</div>
            <div style="font-size:0.9em; color:#555;">
                Cód: ${p.codigo_barras || 'S/N'} | 
                <strong>$${precio}</strong> | 
                <span style="color:${stockColor}">Stock: ${p.existencia}</span>
            </div>
        `;

        div.onclick = () => agregarAlCarrito(p);
        
        // Efecto hover
        div.onmouseover = () => div.style.background = "#f9f9f9";
        div.onmouseout = () => div.style.background = "white";
        
        resultsContainer.appendChild(div);
    });
}

// 3. Agregar al Carrito (Con Validación de Stock)
function agregarAlCarrito(producto) {
    // Validar Stock
    const stockActual = parseInt(producto.existencia) || 0;
    
    if (stockActual <= 0) {
        alert(`❌ No puedes vender "${producto.nombre}".\nEl stock es 0. Registra una COMPRA primero.`);
        return;
    }

    const itemEnCarrito = carrito.find(i => i.id === producto.id);
    
    if (itemEnCarrito) {
        if (itemEnCarrito.cantidad + 1 > stockActual) {
            alert(`⚠️ Stock insuficiente. Solo hay ${stockActual} unidades disponibles.`);
            return;
        }
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: parseFloat(producto.precio), // Asegurar número
            cantidad: 1,
            maxStock: stockActual
        });
    }

    actualizarCarritoDOM();
    
    // Limpiar buscador
    inputSearch.value = "";
    resultsContainer.innerHTML = "";
    inputSearch.focus();
}

// 4. Renderizar Carrito
function actualizarCarritoDOM() {
    cartContainer.innerHTML = "";
    let subtotal = 0;

    if (carrito.length === 0) {
        cartContainer.innerHTML = '<div style="padding:2rem; text-align:center; color:#999;">El carrito está vacío</div>';
        actualizarTotales(0);
        return;
    }

    carrito.forEach((item, index) => {
        const totalLinea = item.cantidad * item.precio;
        subtotal += totalLinea;

        const row = document.createElement("div");
        row.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;";
        
        row.innerHTML = `
            <div style="flex:1">
                <div style="font-weight:500;">${item.nombre}</div>
                <div style="font-size:0.85em; color:#666;">
                    $${item.precio.toFixed(2)} x 
                    <input type="number" min="1" max="${item.maxStock}" value="${item.cantidad}" 
                        onchange="cambiarCantidad(${index}, this.value)" 
                        style="width:50px; padding:2px; text-align:center;">
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:bold;">$${totalLinea.toFixed(2)}</div>
                <button onclick="removerItem(${index})" class="btn btn-danger btn-small" style="margin-top:5px; padding:2px 8px;">Eliminar</button>
            </div>
        `;
        cartContainer.appendChild(row);
    });

    actualizarTotales(subtotal);
}

function actualizarTotales(subtotal) {
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    document.getElementById("subtotal").innerText = `$${subtotal.toFixed(2)}`;
    // Puedes mostrar el IVA en algún lado si tu HTML tiene el elemento, sino solo Total
    document.getElementById("total").innerText = `$${total.toFixed(2)}`;
}

// 5. Funciones Auxiliares (Globales)
window.removerItem = (index) => {
    carrito.splice(index, 1);
    actualizarCarritoDOM();
};

window.cambiarCantidad = (index, nuevaCant) => {
    const cantidad = parseInt(nuevaCant);
    const item = carrito[index];

    if (cantidad < 1) {
        item.cantidad = 1;
        alert("La cantidad mínima es 1");
    } else if (cantidad > item.maxStock) {
        item.cantidad = item.maxStock;
        alert(`Solo tienes ${item.maxStock} unidades en inventario.`);
    } else {
        item.cantidad = cantidad;
    }
    actualizarCarritoDOM();
};

window.limpiarCarrito = () => {
    if (carrito.length > 0 && confirm("¿Vaciar carrito?")) {
        carrito = [];
        actualizarCarritoDOM();
    }
};

window.completarVenta = async () => {
    if (carrito.length === 0) return alert("El carrito está vacío");
    
    if (!confirm(`¿Confirmar venta por ${document.getElementById("total").innerText}?`)) return;

    btnCompletar.disabled = true;
    btnCompletar.textContent = "Procesando...";

    try {
        const res = await fetch('/api/ventas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productos: carrito })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Error al procesar venta");

        // Imprimir Ticket
        imprimirTicket(data.ticket);

        // Resetear
        carrito = [];
        actualizarCarritoDOM();
        alert("¡Venta Exitosa!");

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    } finally {
        btnCompletar.disabled = false;
        btnCompletar.textContent = "Completar Venta";
    }
};

function imprimirTicket(ticket) {
    const ticketArea = document.getElementById("printTicket");
    
    // Rellenar datos del ticket
    document.getElementById("ticketNumber").innerText = ticket.folio;
    document.getElementById("ticketDate").innerText = ticket.fecha;
    
    const itemsHTML = ticket.productos.map(p => `
        <div style="display:flex; justify-content:space-between; font-family:monospace; font-size:12px; margin-bottom:4px;">
            <span>${p.cantidad} x ${p.nombre.substring(0,15)}</span>
            <span>$${(p.cantidad * p.precio).toFixed(2)}</span>
        </div>
    `).join('');
    
    document.getElementById("ticketItems").innerHTML = itemsHTML;
    document.getElementById("ticketSubtotal").innerText = `$${parseFloat(ticket.subtotal).toFixed(2)}`;
    document.getElementById("ticketTotal").innerText = `$${parseFloat(ticket.total).toFixed(2)}`;

    // Imprimir
    ticketArea.style.display = "block";
    window.print();
    // Ocultar después de imprimir (pequeño delay para asegurar que el diálogo de impresión capture el contenido)
    setTimeout(() => { ticketArea.style.display = "none"; }, 500);
}