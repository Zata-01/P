// Ocultar elementos según el rol
if (usuarioActual.rol !== "admin") {
  document.querySelectorAll(".admin-only").forEach((el) => {
    el.style.display = "none"
  })
}

// Datos de ejemplo (en producción, estos vendrían de tu backend MySQL)
const datosMock = {
  estadisticas: {
    ventasHoy: 25430.5,
    productosVendidos: 145,
    productosStock: 523,
    alertasInventario: 8,
  },
  ventasRecientes: [
    { ticket: "T-001", producto: "Laptop HP", cantidad: 1, total: 12500, fecha: "2025-01-15 14:30" },
    { ticket: "T-002", producto: "Mouse Logitech", cantidad: 3, total: 450, fecha: "2025-01-15 14:45" },
    { ticket: "T-003", producto: "Teclado Mecánico", cantidad: 2, total: 2800, fecha: "2025-01-15 15:10" },
    { ticket: "T-004", producto: "Monitor Samsung", cantidad: 1, total: 5600, fecha: "2025-01-15 15:30" },
    { ticket: "T-005", producto: "Webcam HD", cantidad: 4, total: 2400, fecha: "2025-01-15 16:00" },
  ],
  alertasInventario: [
    { producto: "Mouse Logitech", stock: 5, minimo: 10 },
    { producto: "Cable HDMI", stock: 3, minimo: 15 },
    { producto: "Auriculares", stock: 8, minimo: 20 },
  ],
}

// Cargar estadísticas
function cargarEstadisticas() {
  document.getElementById("ventasHoy").textContent =
    "$" + datosMock.estadisticas.ventasHoy.toLocaleString("es-MX", { minimumFractionDigits: 2 })
  document.getElementById("productosVendidos").textContent = datosMock.estadisticas.productosVendidos
  document.getElementById("productosStock").textContent = datosMock.estadisticas.productosStock
  document.getElementById("alertasInventario").textContent = datosMock.estadisticas.alertasInventario
}

// Cargar ventas recientes
function cargarVentasRecientes() {
  const tbody = document.getElementById("recentSalesBody")
  tbody.innerHTML = ""

  datosMock.ventasRecientes.forEach((venta) => {
    const fila = document.createElement("tr")
    fila.innerHTML = `
            <td>${venta.ticket}</td>
            <td>${venta.producto}</td>
            <td>${venta.cantidad}</td>
            <td>$${venta.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
            <td>${venta.fecha}</td>
        `
    tbody.appendChild(fila)
  })
}

// Cargar alertas de inventario
function cargarAlertasInventario() {
  const contenedorAlertas = document.getElementById("inventoryAlerts")
  if (!contenedorAlertas) return

  contenedorAlertas.innerHTML = ""

  if (datosMock.alertasInventario.length === 0) {
    contenedorAlertas.innerHTML = '<p style="color: var(--color-success);">No hay alertas de inventario</p>'
    return
  }

  datosMock.alertasInventario.forEach((alerta) => {
    const divAlerta = document.createElement("div")
    divAlerta.className = "alert alert-warning"
    divAlerta.innerHTML = `
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div>
                <strong>${alerta.producto}</strong> tiene stock bajo: ${alerta.stock} unidades (mínimo: ${alerta.minimo})
            </div>
        `
    contenedorAlertas.appendChild(divAlerta)
  })
}

function cerrarSesion(event) {
    event.preventDefault() // Previene que el <a> siga el href por defecto
    
    fetch('/logout', {
        method: 'POST'
    })
    .then(res => {
        if (res.ok) {
            // Ahora la sesión ha sido limpiada en el servidor Y la cookie en el cliente.
            window.location.href = '/' // Redirigir al inicio
        } else {
            alert('Fallo al cerrar sesión en el servidor.')
        }
    })
}

async function cargarDashboard() {
    try {
        // Ventas Hoy
        const hoy = new Date().toISOString().split('T')[0];
        const resVentas = await fetch(`/api/reportes/ventas?inicio=${hoy}&fin=${hoy}`);
        const ventas = await resVentas.json();
        
        let totalVentas = 0;
        ventas.forEach(v => totalVentas += parseFloat(v.total));
        document.getElementById("ventasHoy").innerText = `$${totalVentas.toFixed(2)}`;
        
        document.getElementById("productosVendidos").innerText = ventas.length; // Transacciones

        // Cargar Ventas Recientes en tabla
        const tbody = document.getElementById("recentSalesBody");
        tbody.innerHTML = "";
        ventas.slice(0, 5).forEach(v => {
            tbody.innerHTML += `
                <tr>
                    <td>V-${v.id}</td>
                    <td>--</td>
                    <td>--</td>
                    <td>$${parseFloat(v.total).toFixed(2)}</td>
                    <td>${new Date(v.fecha).toLocaleTimeString()}</td>
                </tr>
            `;
        });

    } catch (e) { console.error(e); }
}

document.addEventListener("DOMContentLoaded", cargarDashboard);

window.cerrarSesion = cerrarSesion

// Inicializar dashboard
cargarEstadisticas()
cargarVentasRecientes()
cargarAlertasInventario()

// Actualizar cada 30 segundos (simula actualización en tiempo real)
setInterval(() => {
  cargarEstadisticas()
  cargarVentasRecientes()
  cargarAlertasInventario()
}, 30000)
