let productos = []
let paginaActual = 1
const elementosPorPagina = 5 
let totalProductos = 0
const API_BASE = '/api/productos';

async function fetchProductos(q = '', page = 1, limit = elementosPorPagina) {
  try {
    const queryParams = [];
    
    if (q) queryParams.push(`q=${encodeURIComponent(q)}`); 
    
    queryParams.push(`page=${page}`);
    queryParams.push(`limit=${limit}`);
    
    const url = `${API_BASE}?${queryParams.join('&')}`;
    const res = await fetch(url);
    
    if (!res.ok) {
      const errorBody = await res.json();
      throw new Error(errorBody.message || `Error al cargar productos: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    productos = data.items.map(item => ({
      ...item,
      codigoBarras: item.codigo_barras, 
      descripcion: item.descripcion || 'N/A',
      precio: parseFloat(item.precio),
      stock: parseInt(item.existencia, 10),
      imagen: item.imagen
    }));
    
    totalProductos = data.totalItems || productos.length; 
    paginaActual = data.page;
    renderizarProductos();

  } catch (error) {
    console.error("Error en fetchProductos:", error);
    document.getElementById("productsTableBody").innerHTML = '<tr><td colspan="8" style="text-align: center;">Error al cargar productos.</td></tr>';
  }
}

const buscarProductoInput = document.getElementById("searchInput");

buscarProductoInput.addEventListener("input", (e) => {
    const busqueda = (e.target.value || "").trim();
    paginaActual = 1
    fetchProductos(busqueda, 1);
});

function renderizarProductos() {
  const tbody = document.getElementById("productsTableBody")
  tbody.innerHTML = ""

  const productosPaginados = productos;

  if (productosPaginados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No se encontraron productos</td></tr>'
    renderizarPaginacion();
    return
  }

  productosPaginados.forEach((producto) => {
    const fila = document.createElement("tr")

    const acciones =
    `
            <button class="btn btn-small btn-secondary" onclick="editarProducto(${producto.id})">Editar</button>
            <button class="btn btn-small btn-danger" onclick="eliminarProducto(${producto.id})">Eliminar</button>
        `
        
    const imagenUrl = producto.imagen 
        ? `data:image/jpeg;base64,${producto.imagen}` 
        : 'https://via.placeholder.com/50x50?text=No+Img'; 
    
    const imagenHtml = `<img src="${imagenUrl}" alt="${producto.nombre}">`;


    fila.innerHTML = `
            <td>${imagenHtml}</td> 
            <td>${producto.codigoBarras}</td>
            <td>${producto.nombre}</td>
            <td>${producto.descripcion || 'N/A'}</td> 
            <td>$${producto.precio.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
            <td>${producto.stock}</td>
            <td>${acciones}</td>
        `
    tbody.appendChild(fila)
  })

  renderizarPaginacion()
}

// Paginación
function renderizarPaginacion() {
  const paginacion = document.getElementById("pagination")
  paginacion.innerHTML = ""

  const totalPaginas = Math.ceil(totalProductos / elementosPorPagina) || 1; 

  for (let i = 1; i <= totalPaginas; i++) {
    const boton = document.createElement("button")
    boton.textContent = i
    boton.className = i === paginaActual ? "active" : ""
    boton.onclick = () => {
      const q = buscarProductoInput.value.trim() || "";
      fetchProductos(q, i);
    }
    paginacion.appendChild(boton)
  }
}

// Modal de producto
function abrirModalAgregarProducto() {
  document.getElementById("modalTitle").textContent = "Agregar Producto"
  document.getElementById("productForm").reset()
  document.getElementById("productId").value = ""
  document.getElementById("stock").value = 0; 
  document.getElementById("stock").disabled = true;
  document.getElementById("productModal").classList.add("active")
}

function cerrarModalProducto() {
  document.getElementById("productModal").classList.remove("active")
  const q = buscarProductoInput.value.trim() || "";
  fetchProductos(q, paginaActual);
}

async function editarProducto(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error(`Fallo al obtener producto: ${res.statusText}`);
    
    const producto = await res.json();
    
    document.getElementById("modalTitle").textContent = "Editar Producto"
    document.getElementById("productId").value = producto.id
    document.getElementById("codigoBarras").value = producto.codigo_barras
    document.getElementById("nombre").value = producto.nombre
    document.getElementById("descripcion").value = producto.descripcion; 
    document.getElementById("precio").value = producto.precio
    document.getElementById("stock").value = producto.existencia
    document.getElementById("imagenBase64").value = ""; 

    document.getElementById("productModal").classList.add("active")
  } catch (error) {
    console.error("Error al editar producto:", error);
    alert(`Error al cargar producto para edición: ${error.message}`);
  }
}

async function eliminarProducto(id) {
  if (confirm("¿Estás seguro de marcar este producto como AGOTADO?")) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody.message || res.statusText);
      }
      
      alert("Producto marcado como AGOTADO correctamente");
      const q = buscarProductoInput.value.trim() || "";
      fetchProductos(q, paginaActual);
      
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert(`Error al eliminar producto: ${error.message}`);
    }
  }
}

// Guardar producto
document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const id = document.getElementById("productId").value
  
  const productoData = {
    codigo_barras: document.getElementById("codigoBarras").value,
    nombre: document.getElementById("nombre").value,
    descripcion: document.getElementById("descripcion").value || null,
    precio: document.getElementById("precio").value,
    imagenBase64: document.getElementById("imagenBase64").value || null, 
    estado: 'activo'
  }

  let res;
  try {
    if (id) {
      // Editar (PUT)
      const url = `${API_BASE}/${id}`;
      res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoData)
      });
      if (!res.ok) throw new Error(`Fallo al actualizar producto: ${res.statusText}`);
      alert("Producto actualizado correctamente");
    } else {
      // Agregar (POST)
      res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoData)
      });
      if (!res.ok) throw new Error(`Fallo al agregar producto: ${res.statusText}`);
      alert("Producto agregado correctamente");
    }

  } catch (error) {
      console.error("Error al guardar producto:", error);
      let errorMessage = "Error al guardar producto.";
      try {
          if (res) {
              const errorBody = await res.json();
              errorMessage = errorBody.message || errorMessage;
          } else {
              errorMessage = error.message;
          }
      } catch (e) {
          errorMessage = error.message;
      }
      
      alert(errorMessage);
      return;
  }

  cerrarModalProducto()
})


// Exportar a CSV 
function exportarCSV() {
  const encabezados = ["Código de Barras", "Nombre", "Descripción", "Precio", "Stock"]
  const filas = productos.map((p) => [p.codigoBarras, p.nombre, p.descripcion || '', p.precio, p.stock])

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
    event.preventDefault() 
    
    fetch('/logout', {
        method: 'POST'
    })
    .then(res => {
        if (res.ok) {
            window.location.href = '/'
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
fetchProductos();