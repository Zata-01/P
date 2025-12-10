// Datos simulados de usuarios
let usuarios = [
  {
    id: 1,
    nombre: "Administrador",
    usuario: "admin",
    contrasena: "admin123",
    rol: "admin",
    estado: "activo",
    fechaCreacion: "2024-01-01",
  },
  {
    id: 2,
    nombre: "Operador Principal",
    usuario: "operador",
    contrasena: "op123",
    rol: "operador",
    estado: "activo",
    fechaCreacion: "2024-01-05",
  },
  {
    id: 3,
    nombre: "Juan Pérez",
    usuario: "juan.perez",
    contrasena: "juan123",
    rol: "operador",
    estado: "inactivo",
    fechaCreacion: "2024-01-10",
  },
]

let usuarioEnEdicion = null
let paginaActual = 1
const itemsPorPagina = 10

// Declaración de la función verificarAutenticacion
function verificarAutenticacion() {
  // Implementación de la función verificarAutenticacion
  console.log("Verificando autenticación...")
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacion()
  cargarUsuarios()
})

function cargarUsuarios() {
  const tbody = document.getElementById("usuariosTableBody")
  tbody.innerHTML = ""

  if (usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay usuarios registrados</td></tr>'
    return
  }

  const inicio = (paginaActual - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  const usuariosPaginados = usuarios.slice(inicio, fin)

  usuariosPaginados.forEach((usuario) => {
    const row = document.createElement("tr")

    const rolBadge =
      usuario.rol === "admin"
        ? '<span class="badge badge-success">Administrador</span>'
        : '<span class="badge badge-warning">Operador</span>'

    const estadoBadge =
      usuario.estado === "activo"
        ? '<span class="badge badge-success">Activo</span>'
        : '<span class="badge badge-danger">Inactivo</span>'

    row.innerHTML = `
            <td>#${usuario.id.toString().padStart(3, "0")}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.usuario}</td>
            <td>${rolBadge}</td>
            <td>${estadoBadge}</td>
            <td>${new Date(usuario.fechaCreacion).toLocaleDateString("es-MX")}</td>
            <td>
                <button class="btn btn-secondary btn-small" onclick="editarUsuario(${usuario.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
            </td>
        `
    tbody.appendChild(row)
  })

  generarPaginacion()
}

function generarPaginacion() {
  const totalPaginas = Math.ceil(usuarios.length / itemsPorPagina)
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
  cargarUsuarios()
}

function abrirModalAgregarUsuario() {
  usuarioEnEdicion = null
  document.getElementById("tituloModalUsuario").textContent = "Agregar Usuario"
  document.getElementById("formUsuario").reset()
  document.getElementById("usuarioId").value = ""
  document.getElementById("contrasena").required = true
  document.getElementById("modalUsuario").classList.add("active")
}

function cerrarModalUsuario() {
  document.getElementById("modalUsuario").classList.remove("active")
}

function editarUsuario(id) {
  const usuario = usuarios.find((u) => u.id === id)
  if (!usuario) return

  usuarioEnEdicion = usuario
  document.getElementById("tituloModalUsuario").textContent = "Editar Usuario"
  document.getElementById("usuarioId").value = usuario.id
  document.getElementById("nombreCompleto").value = usuario.nombre
  document.getElementById("nombreUsuario").value = usuario.usuario
  document.getElementById("contrasena").value = ""
  document.getElementById("contrasena").required = false
  document.getElementById("rolUsuario").value = usuario.rol
  document.getElementById("estadoUsuario").value = usuario.estado

  document.getElementById("modalUsuario").classList.add("active")
}

function guardarUsuario(evento) {
  evento.preventDefault()

  const id = document.getElementById("usuarioId").value
  const nombre = document.getElementById("nombreCompleto").value
  const usuario = document.getElementById("nombreUsuario").value
  const contrasena = document.getElementById("contrasena").value
  const rol = document.getElementById("rolUsuario").value
  const estado = document.getElementById("estadoUsuario").value

  if (id) {
    // Editar usuario existente
    const index = usuarios.findIndex((u) => u.id === Number.parseInt(id))
    if (index !== -1) {
      usuarios[index].nombre = nombre
      usuarios[index].usuario = usuario
      if (contrasena) {
        usuarios[index].contrasena = contrasena
      }
      usuarios[index].rol = rol
      usuarios[index].estado = estado
    }
    alert("Usuario actualizado exitosamente")
  } else {
    // Agregar nuevo usuario
    if (!contrasena) {
      alert("La contraseña es requerida para nuevos usuarios")
      return
    }

    const nuevoUsuario = {
      id: usuarios.length + 1,
      nombre: nombre,
      usuario: usuario,
      contrasena: contrasena,
      rol: rol,
      estado: estado,
      fechaCreacion: new Date().toISOString().split("T")[0],
    }

    usuarios.push(nuevoUsuario)
    alert("Usuario creado exitosamente")
  }

  // Aquí harías una llamada a tu API backend
  // fetch('/api/usuarios', { method: 'POST', body: JSON.stringify(usuario) })

  cerrarModalUsuario()
  cargarUsuarios()
}

function eliminarUsuario(id) {
  const usuario = usuarios.find((u) => u.id === id)

  if (!usuario) return

  // No permitir eliminar el usuario actual
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"))
  if (usuarioActual && usuarioActual.id === id) {
    alert("No puedes eliminar tu propio usuario")
    return
  }

  if (confirm(`¿Estás seguro de eliminar al usuario "${usuario.nombre}"?`)) {
    usuarios = usuarios.filter((u) => u.id !== id)

    // Aquí harías una llamada a tu API backend
    // fetch(`/api/usuarios/${id}`, { method: 'DELETE' })

    alert("Usuario eliminado exitosamente")
    cargarUsuarios()
  }
}

// Búsqueda de usuarios
document.getElementById("buscarUsuario").addEventListener("input", (e) => {
  const busqueda = e.target.value.toLowerCase()

  if (busqueda === "") {
    cargarUsuarios()
    return
  }

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(busqueda) ||
      usuario.usuario.toLowerCase().includes(busqueda) ||
      usuario.rol.toLowerCase().includes(busqueda),
  )

  const tbody = document.getElementById("usuariosTableBody")
  tbody.innerHTML = ""

  if (usuariosFiltrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No se encontraron resultados</td></tr>'
    return
  }

  usuariosFiltrados.forEach((usuario) => {
    const row = document.createElement("tr")

    const rolBadge =
      usuario.rol === "admin"
        ? '<span class="badge badge-success">Administrador</span>'
        : '<span class="badge badge-warning">Operador</span>'

    const estadoBadge =
      usuario.estado === "activo"
        ? '<span class="badge badge-success">Activo</span>'
        : '<span class="badge badge-danger">Inactivo</span>'

    row.innerHTML = `
            <td>#${usuario.id.toString().padStart(3, "0")}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.usuario}</td>
            <td>${rolBadge}</td>
            <td>${estadoBadge}</td>
            <td>${new Date(usuario.fechaCreacion).toLocaleDateString("es-MX")}</td>
            <td>
                <button class="btn btn-secondary btn-small" onclick="editarUsuario(${usuario.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
            </td>
        `
    tbody.appendChild(row)
  })
})
