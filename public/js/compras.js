// Datos simulados de compras
const compras = [
  {
    id: 1,
    proveedor: "Distribuidora Central",
    productoId: 1,
    productoNombre: "Laptop HP",
    cantidad: 5,
    precioUnitario: 12000,
    total: 60000,
    fecha: "2024-01-15",
  },
  {
    id: 2,
    proveedor: "Tech Supplies",
    productoId: 2,
    productoNombre: "Mouse Logitech",
    cantidad: 20,
    precioUnitario: 200,
    total: 4000,
    fecha: "2024-01-14",
  },
]

// Productos disponibles (simulado)
const productos = [
  { id: 1, nombre: "Laptop HP", codigo: "LPT001", stock: 10 },
  { id: 2, nombre: "Mouse Logitech", codigo: "MS002", stock: 25 },
  { id: 3, nombre: "Teclado Mecánico", codigo: "TEC003", stock: 15 },
]

let paginaActual = 1
const itemsPorPagina = 10

// Función para verificar autenticación
function verificarAutenticacion() {
  // Implementación de la verificación de autenticación
  console.log("Verificando autenticación...")
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacion()
  cargarProductosSelect()
  cargarCompras()

  // Calcular total automáticamente
  document.getElementById("cantidad").addEventListener("input", calcularTotal)
  document.getElementById("precioUnitario").addEventListener("input", calcularTotal)
})

function cargarProductosSelect() {
  const select = document.getElementById("productoCompra")
  select.innerHTML = '<option value="">Seleccione un producto</option>'

  productos.forEach((producto) => {
    const option = document.createElement("option")
    option.value = producto.id
    option.textContent = `${producto.nombre} (${producto.codigo})`
    select.appendChild(option)
  })
}

function cargarCompras() {
  const tbody = document.getElementById("comprasTableBody")
  tbody.innerHTML = ""

  if (compras.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay compras registradas</td></tr>'
    return
  }

  const inicio = (paginaActual - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  const comprasPaginadas = compras.slice(inicio, fin)

  comprasPaginadas.forEach((compra) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>#${compra.id.toString().padStart(4, "0")}</td>
            <td>${compra.proveedor}</td>
            <td>${compra.productoNombre}</td>
            <td>${compra.cantidad}</td>
            <td>$${compra.precioUnitario.toFixed(2)}</td>
            <td>$${compra.total.toFixed(2)}</td>
            <td>${new Date(compra.fecha).toLocaleDateString("es-MX")}</td>
        `
    tbody.appendChild(row)
  })

  generarPaginacion()
}

function generarPaginacion() {
  const totalPaginas = Math.ceil(compras.length / itemsPorPagina)
  const paginacion = document.getElementById("pagination")
  paginacion.innerHTML = ""

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button")
    btn.textContent = i
    btn.className = i === paginaActual ? "active" : ""
    btn.onclick = () => cambiarPagina(i)
    paginacion.appendChild(btn)
  }
}

function cambiarPagina(pagina) {
  paginaActual = pagina
  cargarCompras()
}

function abrirModalRegistrarCompra() {
  document.getElementById("modalCompra").classList.add("active")
  document.getElementById("formCompra").reset()
  document.getElementById("totalCompra").textContent = "$0.00"
}

function cerrarModalCompra() {
  document.getElementById("modalCompra").classList.remove("active")
}

function calcularTotal() {
  const cantidad = Number.parseFloat(document.getElementById("cantidad").value) || 0
  const precioUnitario = Number.parseFloat(document.getElementById("precioUnitario").value) || 0
  const total = cantidad * precioUnitario
  document.getElementById("totalCompra").textContent = `$${total.toFixed(2)}`
}

function registrarCompra(evento) {
  evento.preventDefault()

  const productoId = Number.parseInt(document.getElementById("productoCompra").value)
  const producto = productos.find((p) => p.id === productoId)
  const proveedor = document.getElementById("proveedor").value
  const cantidad = Number.parseInt(document.getElementById("cantidad").value)
  const precioUnitario = Number.parseFloat(document.getElementById("precioUnitario").value)
  const total = cantidad * precioUnitario

  // Crear nueva compra
  const nuevaCompra = {
    id: compras.length + 1,
    proveedor: proveedor,
    productoId: productoId,
    productoNombre: producto.nombre,
    cantidad: cantidad,
    precioUnitario: precioUnitario,
    total: total,
    fecha: new Date().toISOString().split("T")[0],
  }

  compras.unshift(nuevaCompra)

  // Actualizar stock del producto (simulado)
  producto.stock += cantidad

  // Aquí harías una llamada a tu API backend
  // fetch('/api/compras', { method: 'POST', body: JSON.stringify(nuevaCompra) })

  alert("Compra registrada exitosamente")
  cerrarModalCompra()
  cargarCompras()
}

// Búsqueda de productos
document.getElementById("buscarProducto").addEventListener("input", (e) => {
  const busqueda = e.target.value.toLowerCase()

  if (busqueda === "") {
    cargarCompras()
    return
  }

  const comprasFiltradas = compras.filter(
    (compra) =>
      compra.productoNombre.toLowerCase().includes(busqueda) ||
      compra.proveedor.toLowerCase().includes(busqueda) ||
      compra.id.toString().includes(busqueda),
  )

  const tbody = document.getElementById("comprasTableBody")
  tbody.innerHTML = ""

  if (comprasFiltradas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No se encontraron resultados</td></tr>'
    return
  }

  comprasFiltradas.forEach((compra) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>#${compra.id.toString().padStart(4, "0")}</td>
            <td>${compra.proveedor}</td>
            <td>${compra.productoNombre}</td>
            <td>${compra.cantidad}</td>
            <td>$${compra.precioUnitario.toFixed(2)}</td>
            <td>$${compra.total.toFixed(2)}</td>
            <td>${new Date(compra.fecha).toLocaleDateString("es-MX")}</td>
        `
    tbody.appendChild(row)
  })
})

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

window.cerrarSesion = cerrarSesion