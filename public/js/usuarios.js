let usuarios = []
let usuarioEnEdicion = null
let paginaActual = 1
const itemsPorPagina = 5
const API_BASE = '/api/usuarios'

document.addEventListener("DOMContentLoaded", () => {
  cargarUsuarios()
})

async function fetchUsuarios() {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) {
            const errorBody = await res.json();
            throw new Error(errorBody.message || `Error al cargar usuarios: ${res.statusText}`);
        }
        return await res.json();
    } catch (error) {
        console.error("Error en fetchUsuarios:", error);
        alert(`Error al cargar usuarios: ${error.message}`);
        return [];
    }
}

function cargarUsuariosPaginado(data) {
  const tbody = document.getElementById("usuariosTableBody")
  tbody.innerHTML = ""

  const colspan = 4;

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align: center;">No se encontraron resultados</td></tr>`
    generarPaginacion(0);
    return;
  }

  const inicio = (paginaActual - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  const usuariosPaginados = data.slice(inicio, fin)

  usuariosPaginados.forEach((usuario) => {
    const row = document.createElement("tr")

    const rolDisplay = usuario.rol === "admin" ? "Administrador" : "Usuario"
    const rolBadgeClass = usuario.rol === "admin" ? "badge-success" : "badge-warning"
    const rolBadge = `<span class="badge ${rolBadgeClass}">${rolDisplay}</span>`

    row.innerHTML = `
            <td>#${usuario.id.toString()}</td>
            <td>${usuario.usuario}</td>
            <td>${rolBadge}</td>
            <td>
                <button class="btn btn-secondary btn-small" onclick="editarUsuario(${usuario.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
            </td>
        `
    tbody.appendChild(row)
  })

  generarPaginacion(data.length)
}

async function cargarUsuarios() {
  usuarios = await fetchUsuarios()
  cargarUsuariosPaginado(usuarios)
}

function generarPaginacion(totalItems) {
  const totalPaginas = Math.ceil(totalItems / itemsPorPagina)
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
  
  const busqueda = document.getElementById("buscarUsuario")?.value.toLowerCase() || "";
  const dataToRender = busqueda ? 
    usuarios.filter(u => 
      (u.usuario && u.usuario.toLowerCase().includes(busqueda)) ||
      (u.rol && u.rol.toLowerCase().includes(busqueda))
    ) : usuarios;
    
  cargarUsuariosPaginado(dataToRender) 
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
  document.getElementById("nombreUsuario").value = usuario.usuario
  document.getElementById("contrasena").value = ""
  document.getElementById("contrasena").required = false
  document.getElementById("rolUsuario").value = usuario.rol;
  document.getElementById("modalUsuario").classList.add("active")
}

async function guardarUsuario(evento) {
  evento.preventDefault()

  const id = document.getElementById("usuarioId").value
  const usuario = document.getElementById("nombreUsuario").value
  const password = document.getElementById("contrasena").value
  const rol = document.getElementById("rolUsuario").value

  const userData = {
    usuario,
    password: password || undefined,
    rol,
  }
  
  let res;
  try {
    if (id) {
      const url = `${API_BASE}/${id}`;
      res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!res.ok) throw new Error(`Fallo al actualizar usuario: ${res.statusText}`);
      alert("Usuario actualizado exitosamente");
    } else {
      if (!password) {
        alert("La contraseña es requerida para nuevos usuarios");
        return;
      }
      
      res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!res.ok) throw new Error(`Fallo al crear usuario: ${res.statusText}`);
      alert("Usuario creado exitosamente");
    }

  } catch (error) {
      console.error("Error al guardar usuario:", error);
      let errorMessage = "Error al guardar usuario.";
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

  cerrarModalUsuario()
  await cargarUsuarios() 
}

async function eliminarUsuario(id) {
  const usuario = usuarios.find((u) => u.id === id)

  if (!usuario) return

  if (usuario.rol === "admin") {
    alert("No puedes eliminar a un administrador")
    return
  }
  
  if (confirm(`¿Estás seguro de eliminar al usuario con ID #${id}?`)) {
      try {
          const url = `${API_BASE}/${id}`;
          const res = await fetch(url, { method: 'DELETE' });
          
          if (!res.ok) {
            const errorBody = await res.json();
            throw new Error(errorBody.message || res.statusText);
          }

          alert("Usuario eliminado exitosamente");
          await cargarUsuarios() 
      } catch (error) {
          console.error("Error al eliminar usuario:", error);
          alert(`Error al eliminar usuario: ${error.message}`);
      }
  }
}
const buscarUsuarioInput = document.getElementById("buscarUsuario");

buscarUsuarioInput.addEventListener("input", (e) => {
  const busqueda = e.target.value.toLowerCase()

  if (busqueda === "") {
    cargarUsuariosPaginado(usuarios)
    return
  }

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      (usuario.usuario && usuario.usuario.toLowerCase().includes(busqueda))
  )

  cargarUsuariosPaginado(usuariosFiltrados)
});

buscarUsuarioInput.addEventListener("blur", () => {
    setTimeout(() => {
        if (buscarUsuarioInput.value !== "") {
            buscarUsuarioInput.value = "";
            cargarUsuariosPaginado(usuarios);
        }
    }, 150);
});

const buscarUsuarioInputId = document.getElementById("buscarUsuarioId");

buscarUsuarioInputId.addEventListener("input", (e) => {
  const busqueda = e.target.value.toLowerCase()

  if (busqueda === "") {
    cargarUsuariosPaginado(usuarios)
    return
  }

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      (usuario.id && usuario.id.toString().includes(busqueda))
  )

  cargarUsuariosPaginado(usuariosFiltrados)
});

buscarUsuarioInputId.addEventListener("blur", () => {
    setTimeout(() => {
        if (buscarUsuarioInputId.value !== "") {
            buscarUsuarioInputId.value = "";
            cargarUsuariosPaginado(usuarios);
        }
    }, 150);
});

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
window.cerrarSesion = cerrarSesion
window.abrirModalAgregarUsuario = abrirModalAgregarUsuario
window.cerrarModalUsuario = cerrarModalUsuario
window.editarUsuario = editarUsuario
window.eliminarUsuario = eliminarUsuario
window.guardarUsuario = guardarUsuario
window.cambiarPagina = cambiarPagina