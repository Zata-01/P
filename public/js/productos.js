// Verificar autenticación
const usuarioActual = window.verificarAutenticacion()
document.getElementById("userInfo").textContent = `${usuarioActual.nombre} (${usuarioActual.rol})`

// Ocultar elementos según el rol
if (usuarioActual.rol !== "admin") {
  document.querySelectorAll(".admin-only").forEach((el) => (el.style.display = "none"))
}

// Datos de productos (mock - en producción viene de MySQL)
let productos = [
  {
    id: 1,
    codigoBarras: "7501234567890",
    nombre: "Laptop HP Pavilion",
    categoria: "Computadoras",
    precio: 12500,
    stock: 15,
    stockMinimo: 5,
  },
  {
    id: 2,
    codigoBarras: "7501234567891",
    nombre: "Mouse Logitech",
    categoria: "Periféricos",
    precio: 150,
    stock: 5,
    stockMinimo: 10,
  },
  {
    id: 3,
    codigoBarras: "7501234567892",
    nombre: "Teclado Mecánico",
    categoria: "Periféricos",
    precio: 1400,
    stock: 20,
    stockMinimo: 8,
  },
  {
    id: 4,
    codigoBarras: "7501234567893",
    nombre: 'Monitor Samsung 24"',
    categoria: "Electrónica",
    precio: 5600,
    stock: 12,
    stockMinimo: 6,
  },
  {
    id: 5,
    codigoBarras: "7501234567894",
    nombre: "Webcam HD",
    categoria: "Accesorios",
    precio: 600,
    stock: 25,
    stockMinimo: 10,
  },
]

let paginaActual = 1
const elementosPorPagina = 10
let productosFiltrados = [...productos]

// Buscar productos
document.getElementById("searchInput").addEventListener("input", (e) => {
  const busqueda = e.target.value.toLowerCase()
  productosFiltrados = productos.filter(
    (p) => p.nombre.toLowerCase().includes(busqueda) || p.codigoBarras.includes(busqueda),
  )
  paginaActual = 1
  renderizarProductos()
})

// Renderizar productos
function renderizarProductos() {
  const tbody = document.getElementById("productsTableBody")
  tbody.innerHTML = ""

  const inicio = (paginaActual - 1) * elementosPorPagina
  const fin = inicio + elementosPorPagina
  const productosPaginados = productosFiltrados.slice(inicio, fin)

  if (productosPaginados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No se encontraron productos</td></tr>'
    return
  }

  productosPaginados.forEach((producto) => {
    const fila = document.createElement("tr")

    const estadoStock =
      producto.stock <= producto.stockMinimo
        ? '<span class="badge badge-warning">Bajo</span>'
        : '<span class="badge badge-success">Normal</span>'

    const acciones =
      usuarioActual.rol === "admin"
        ? `
            <button class="btn btn-small btn-secondary" onclick="editarProducto(${producto.id})">Editar</button>
            <button class="btn btn-small btn-danger" onclick="eliminarProducto(${producto.id})">Eliminar</button>
        `
        : ""

    fila.innerHTML = `
            <td>${producto.codigoBarras}</td>
            <td>${producto.nombre}</td>
            <td>${producto.categoria}</td>
            <td>$${producto.precio.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
            <td>${producto.stock}</td>
            <td>${estadoStock}</td>
            ${usuarioActual.rol === "admin" ? `<td>${acciones}</td>` : ""}
        `
    tbody.appendChild(fila)
  })

  renderizarPaginacion()
}

// Paginación
function renderizarPaginacion() {
  const paginacion = document.getElementById("pagination")
  paginacion.innerHTML = ""

  const totalPaginas = Math.ceil(productosFiltrados.length / elementosPorPagina)

  for (let i = 1; i <= totalPaginas; i++) {
    const boton = document.createElement("button")
    boton.textContent = i
    boton.className = i === paginaActual ? "active" : ""
    boton.onclick = () => {
      paginaActual = i
      renderizarProductos()
    }
    paginacion.appendChild(boton)
  }
}

// Modal de producto
function abrirModalAgregarProducto() {
  document.getElementById("modalTitle").textContent = "Agregar Producto"
  document.getElementById("productForm").reset()
  document.getElementById("productId").value = ""
  document.getElementById("productModal").classList.add("active")
}

function cerrarModalProducto() {
  document.getElementById("productModal").classList.remove("active")
}

function editarProducto(id) {
  const producto = productos.find((p) => p.id === id)
  if (!producto) return

  document.getElementById("modalTitle").textContent = "Editar Producto"
  document.getElementById("productId").value = producto.id
  document.getElementById("codigoBarras").value = producto.codigoBarras
  document.getElementById("nombre").value = producto.nombre
  document.getElementById("categoria").value = producto.categoria
  document.getElementById("precio").value = producto.precio
  document.getElementById("stock").value = producto.stock
  document.getElementById("stockMinimo").value = producto.stockMinimo

  document.getElementById("productModal").classList.add("active")
}

function eliminarProducto(id) {
  if (confirm("¿Estás seguro de eliminar este producto?")) {
    productos = productos.filter((p) => p.id !== id)
    productosFiltrados = [...productos]
    renderizarProductos()
    alert("Producto eliminado correctamente")
  }
}

// Guardar producto
document.getElementById("productForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const id = document.getElementById("productId").value
  const producto = {
    id: id ? Number.parseInt(id) : Date.now(),
    codigoBarras: document.getElementById("codigoBarras").value,
    nombre: document.getElementById("nombre").value,
    categoria: document.getElementById("categoria").value,
    precio: Number.parseFloat(document.getElementById("precio").value),
    stock: Number.parseInt(document.getElementById("stock").value),
    stockMinimo: Number.parseInt(document.getElementById("stockMinimo").value),
  }

  if (id) {
    // Editar
    const indice = productos.findIndex((p) => p.id === Number.parseInt(id))
    productos[indice] = producto
  } else {
    // Agregar
    productos.push(producto)
  }

  productosFiltrados = [...productos]
  renderizarProductos()
  cerrarModalProducto()
  alert("Producto guardado correctamente")
})

// Exportar a CSV
function exportarCSV() {
  const encabezados = ["Código", "Nombre", "Categoría", "Precio", "Stock", "Stock Mínimo"]
  const filas = productos.map((p) => [p.codigoBarras, p.nombre, p.categoria, p.precio, p.stock, p.stockMinimo])

  let csv = encabezados.join(",") + "\n"
  filas.forEach((fila) => {
    csv += fila.join(",") + "\n"
  })

  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "productos.csv"
  a.click()
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

window.abrirModalAgregarProducto = abrirModalAgregarProducto
window.cerrarModalProducto = cerrarModalProducto
window.editarProducto = editarProducto
window.eliminarProducto = eliminarProducto
window.exportarCSV = exportarCSV
window.cerrarSesion = cerrarSesion

// Inicializar
renderizarProductos()
