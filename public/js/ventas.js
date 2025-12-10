const verificarAutenticacion = () => {
  return { nombre: "Ricardo Herrera", rol: "admin" }
}

const usuarioActual = verificarAutenticacion()
document.getElementById("userInfo").textContent = `${usuarioActual.nombre} (${usuarioActual.rol})`

if (usuarioActual.rol !== "admin") {
  document.querySelectorAll(".admin-only").forEach((el) => (el.style.display = "none"))
}

const productos = [
  { id: 1, codigoBarras: "7501234567890", nombre: "Laptop HP Pavilion", precio: 12500, stock: 15 },
  { id: 2, codigoBarras: "7501234567891", nombre: "Mouse Logitech", precio: 150, stock: 5 },
  { id: 3, codigoBarras: "7501234567892", nombre: "Teclado Mecánico", precio: 1400, stock: 20 },
  { id: 4, codigoBarras: "7501234567893", nombre: 'Monitor Samsung 24"', precio: 5600, stock: 12 },
  { id: 5, codigoBarras: "7501234567894", nombre: "Webcam HD", precio: 600, stock: 25 },
]

let carrito = []

document.getElementById("barcodeSearch").addEventListener("input", (e) => {
  const busqueda = e.target.value.toLowerCase()

  if (busqueda.length < 2) {
    document.getElementById("productResults").innerHTML = ""
    return
  }

  const resultados = productos.filter(
    (p) => p.nombre.toLowerCase().includes(busqueda) || p.codigoBarras.includes(busqueda),
  )

  const divResultados = document.getElementById("productResults")
  divResultados.innerHTML = ""

  resultados.forEach((producto) => {
    const div = document.createElement("div")
    div.style.cssText =
      "padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius); margin-bottom: 0.5rem; cursor: pointer;"
    div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600;">${producto.nombre}</div>
                    <div style="font-size: 0.875rem; color: var(--color-muted);">
                        ${producto.codigoBarras} | Stock: ${producto.stock}
                    </div>
                </div>
                <div style="font-weight: 700; color: var(--color-primary);">
                    $${producto.precio.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </div>
            </div>
        `
    div.onclick = () => agregarAlCarrito(producto)
    divResultados.appendChild(div)
  })
})

function agregarAlCarrito(producto) {
  const existente = carrito.find((item) => item.id === producto.id)

  if (existente) {
    if (existente.cantidad >= producto.stock) {
      alert("No hay suficiente stock disponible")
      return
    }
    existente.cantidad++
  } else {
    carrito.push({ ...producto, cantidad: 1 })
  }

  actualizarCarrito()
  document.getElementById("barcodeSearch").value = ""
  document.getElementById("productResults").innerHTML = ""
}

function actualizarCarrito() {
  const divCarrito = document.getElementById("cartItems")

  if (carrito.length === 0) {
    divCarrito.innerHTML = '<p style="text-align: center; color: var(--color-muted); padding: 2rem;">Carrito vacío</p>'
    document.getElementById("subtotal").textContent = "$0.00"
    document.getElementById("total").textContent = "$0.00"
    return
  }

  divCarrito.innerHTML = ""
  let subtotal = 0

  carrito.forEach((item) => {
    const totalItem = item.precio * item.cantidad
    subtotal += totalItem

    const div = document.createElement("div")
    div.style.cssText =
      "padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius); margin-bottom: 0.5rem;"
    div.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.5rem;">${item.nombre}</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="actualizarCantidad(${item.id}, -1)" class="btn btn-small btn-secondary">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="actualizarCantidad(${item.id}, 1)" class="btn btn-small btn-secondary">+</button>
                    <button onclick="removerDelCarrito(${item.id})" class="btn btn-small btn-danger">×</button>
                </div>
                <div style="font-weight: 700;">
                    $${totalItem.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </div>
            </div>
        `
    divCarrito.appendChild(div)
  })

  document.getElementById("subtotal").textContent = "$" + subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })
  document.getElementById("total").textContent = "$" + subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })
}

function actualizarCantidad(id, cambio) {
  const item = carrito.find((i) => i.id === id)
  if (!item) return

  const nuevaCantidad = item.cantidad + cambio

  if (nuevaCantidad <= 0) {
    removerDelCarrito(id)
    return
  }

  const producto = productos.find((p) => p.id === id)
  if (nuevaCantidad > producto.stock) {
    alert("No hay suficiente stock disponible")
    return
  }

  item.cantidad = nuevaCantidad
  actualizarCarrito()
}

function removerDelCarrito(id) {
  carrito = carrito.filter((item) => item.id !== id)
  actualizarCarrito()
}

function limpiarCarrito() {
  if (carrito.length > 0 && !confirm("¿Deseas cancelar esta venta?")) return
  carrito = []
  actualizarCarrito()
}

function completarVenta() {
  if (carrito.length === 0) {
    alert("El carrito está vacío")
    return
  }

  const metodoPago = document.getElementById("paymentMethod").value
  const numeroTicket = "T-" + Date.now().toString().slice(-6)
  const ahora = new Date()

  document.getElementById("ticketNumber").textContent = "No: " + numeroTicket
  document.getElementById("ticketDate").textContent = ahora.toLocaleString("es-MX")

  const itemsTicket = document.getElementById("ticketItems")
  itemsTicket.innerHTML = ""
  let subtotal = 0

  carrito.forEach((item) => {
    const totalItem = item.precio * item.cantidad
    subtotal += totalItem

    const div = document.createElement("div")
    div.style.cssText = "display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem;"
    div.innerHTML = `
            <div>
                <div>${item.nombre}</div>
                <div style="color: #666;">${item.cantidad} x $${item.precio.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</div>
            </div>
            <div>$${totalItem.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</div>
        `
    itemsTicket.appendChild(div)
  })

  document.getElementById("ticketSubtotal").textContent =
    "$" + subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })
  document.getElementById("ticketTotal").textContent =
    "$" + subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })
  document.getElementById("ticketPayment").textContent = metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)

  document.getElementById("printTicket").style.display = "block"
  window.print()
  document.getElementById("printTicket").style.display = "none"

  carrito = []
  actualizarCarrito()

  alert("¡Venta completada! Ticket: " + numeroTicket)
}

function cerrarSesion() {
  alert("Sesión cerrada")
  window.location.reload()
}

window.agregarAlCarrito = agregarAlCarrito
window.actualizarCantidad = actualizarCantidad
window.removerDelCarrito = removerDelCarrito
window.limpiarCarrito = limpiarCarrito
window.completarVenta = completarVenta
window.cerrarSesion = cerrarSesion

actualizarCarrito()
