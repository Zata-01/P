// Datos simulados
const devoluciones = [
  {
    id: 1,
    ticketId: 1,
    numeroTicket: "0001",
    productoId: 1,
    productoNombre: "Laptop HP",
    cantidad: 1,
    montoDevuelto: 15000,
    motivo: "Producto defectuoso",
    observaciones: "Pantalla no enciende",
    fecha: "2024-01-16",
  },
]

// Tickets de venta simulados
const tickets = [
  {
    id: 1,
    numero: "0001",
    productos: [{ id: 1, nombre: "Laptop HP", cantidad: 2, precio: 15000 }],
    total: 30000,
    fecha: "2024-01-15",
  },
  {
    id: 2,
    numero: "0002",
    productos: [{ id: 2, nombre: "Mouse Logitech", cantidad: 3, precio: 350 }],
    total: 1050,
    fecha: "2024-01-15",
  },
]

let ticketSeleccionado = null
let paginaActual = 1
const itemsPorPagina = 10

// Función para verificar autenticación (simulada)
function verificarAutenticacion() {
  // Implementación de la verificación de autenticación
  console.log("Verificando autenticación...")
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacion()
  cargarDevoluciones()
})

function cargarDevoluciones() {
  const tbody = document.getElementById("devolucionesTableBody")
  tbody.innerHTML = ""

  if (devoluciones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay devoluciones registradas</td></tr>'
    return
  }

  const inicio = (paginaActual - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  const devolucionesPaginadas = devoluciones.slice(inicio, fin)

  devolucionesPaginadas.forEach((devolucion) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>#${devolucion.id.toString().padStart(4, "0")}</td>
            <td>#${devolucion.numeroTicket}</td>
            <td>${devolucion.productoNombre}</td>
            <td>${devolucion.cantidad}</td>
            <td>$${devolucion.montoDevuelto.toFixed(2)}</td>
            <td>${devolucion.motivo}</td>
            <td>${new Date(devolucion.fecha).toLocaleDateString("es-MX")}</td>
        `
    tbody.appendChild(row)
  })

  generarPaginacion()
}

function generarPaginacion() {
  const totalPaginas = Math.ceil(devoluciones.length / itemsPorPagina)
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
  cargarDevoluciones()
}

function abrirModalDevolucion() {
  document.getElementById("modalDevolucion").classList.add("active")
  document.getElementById("formDevolucion").reset()
  document.getElementById("ticketInfo").style.display = "none"
  document.getElementById("btnRegistrarDevolucion").disabled = true
  ticketSeleccionado = null
}

function cerrarModalDevolucion() {
  document.getElementById("modalDevolucion").classList.remove("active")
}

function buscarTicket() {
  const numeroTicket = document.getElementById("numeroTicket").value

  if (!numeroTicket) {
    alert("Ingrese un número de ticket")
    return
  }

  const ticket = tickets.find((t) => t.numero === numeroTicket)

  if (!ticket) {
    alert("Ticket no encontrado")
    return
  }

  ticketSeleccionado = ticket

  // Mostrar información del ticket
  document.getElementById("ticketInfo").style.display = "block"

  // Cargar productos del ticket
  const select = document.getElementById("productoDevolucion")
  select.innerHTML = '<option value="">Seleccione un producto</option>'

  ticket.productos.forEach((producto) => {
    const option = document.createElement("option")
    option.value = producto.id
    option.dataset.precio = producto.precio
    option.dataset.maxCantidad = producto.cantidad
    option.textContent = `${producto.nombre} - Cantidad vendida: ${producto.cantidad}`
    select.appendChild(option)
  })

  document.getElementById("btnRegistrarDevolucion").disabled = false
}

// Calcular monto de devolución
document.getElementById("productoDevolucion").addEventListener("change", calcularMontoDevolucion)
document.getElementById("cantidadDevolucion").addEventListener("input", calcularMontoDevolucion)

function calcularMontoDevolucion() {
  const select = document.getElementById("productoDevolucion")
  const selectedOption = select.options[select.selectedIndex]

  if (!selectedOption.value) return

  const precio = Number.parseFloat(selectedOption.dataset.precio)
  const maxCantidad = Number.parseInt(selectedOption.dataset.maxCantidad)
  const cantidad = Number.parseInt(document.getElementById("cantidadDevolucion").value) || 0

  document.getElementById("maxCantidad").textContent = `Máximo: ${maxCantidad} unidades`

  if (cantidad > maxCantidad) {
    document.getElementById("cantidadDevolucion").value = maxCantidad
    document.getElementById("montoDevolucion").textContent = `$${(precio * maxCantidad).toFixed(2)}`
  } else {
    document.getElementById("montoDevolucion").textContent = `$${(precio * cantidad).toFixed(2)}`
  }
}

function registrarDevolucion(evento) {
  evento.preventDefault()

  if (!ticketSeleccionado) {
    alert("Debe buscar un ticket primero")
    return
  }

  const productoId = Number.parseInt(document.getElementById("productoDevolucion").value)
  const productoTicket = ticketSeleccionado.productos.find((p) => p.id === productoId)
  const cantidad = Number.parseInt(document.getElementById("cantidadDevolucion").value)
  const motivo = document.getElementById("motivoDevolucion").value
  const observaciones = document.getElementById("observaciones").value
  const montoDevuelto = productoTicket.precio * cantidad

  // Validar cantidad
  if (cantidad > productoTicket.cantidad) {
    alert("La cantidad a devolver no puede ser mayor a la cantidad vendida")
    return
  }

  // Crear nueva devolución
  const nuevaDevolucion = {
    id: devoluciones.length + 1,
    ticketId: ticketSeleccionado.id,
    numeroTicket: ticketSeleccionado.numero,
    productoId: productoId,
    productoNombre: productoTicket.nombre,
    cantidad: cantidad,
    montoDevuelto: montoDevuelto,
    motivo: motivo,
    observaciones: observaciones,
    fecha: new Date().toISOString().split("T")[0],
  }

  devoluciones.unshift(nuevaDevolucion)

  // Aquí harías una llamada a tu API backend
  // fetch('/api/devoluciones', { method: 'POST', body: JSON.stringify(nuevaDevolucion) })

  alert("Devolución registrada exitosamente")
  cerrarModalDevolucion()
  cargarDevoluciones()
}

// Búsqueda
document.getElementById("buscarTicket").addEventListener("input", (e) => {
  const busqueda = e.target.value.toLowerCase()

  if (busqueda === "") {
    cargarDevoluciones()
    return
  }

  const devolucionesFiltradas = devoluciones.filter(
    (dev) =>
      dev.numeroTicket.includes(busqueda) ||
      dev.productoNombre.toLowerCase().includes(busqueda) ||
      dev.motivo.toLowerCase().includes(busqueda),
  )

  const tbody = document.getElementById("devolucionesTableBody")
  tbody.innerHTML = ""

  if (devolucionesFiltradas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No se encontraron resultados</td></tr>'
    return
  }

  devolucionesFiltradas.forEach((devolucion) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>#${devolucion.id.toString().padStart(4, "0")}</td>
            <td>#${devolucion.numeroTicket}</td>
            <td>${devolucion.productoNombre}</td>
            <td>${devolucion.cantidad}</td>
            <td>$${devolucion.montoDevuelto.toFixed(2)}</td>
            <td>${devolucion.motivo}</td>
            <td>${new Date(devolucion.fecha).toLocaleDateString("es-MX")}</td>
        `
    tbody.appendChild(row)
  })
})
