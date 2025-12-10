// Autenticación y gestión de sesión
const CLAVE_ALMACENAMIENTO_AUTH = "pos_usuario"

// Usuarios de ejemplo (en producción, esto vendría de tu backend)
const BASE_USUARIOS = {
  admin: { contrasena: "admin123", rol: "admin", nombre: "Administrador" },
  operador: { contrasena: "op123", rol: "operador", nombre: "Operador 1" },
}

// Login
const formularioLogin = document.getElementById("loginForm")
if (formularioLogin) {
  formularioLogin.addEventListener("submit", (e) => {
    e.preventDefault()

    const nombreUsuario = document.getElementById("username").value
    const contrasena = document.getElementById("password").value
    const rol = document.getElementById("role").value

    // Validación simple (en producción, esto sería una llamada al backend)
    const usuario = BASE_USUARIOS[nombreUsuario]

    if (usuario && usuario.contrasena === contrasena && usuario.rol === rol) {
      // Guardar sesión
      const datosSesion = {
        nombreUsuario: nombreUsuario,
        rol: rol,
        nombre: usuario.nombre,
        horaLogin: new Date().toISOString(),
      }

      localStorage.setItem(CLAVE_ALMACENAMIENTO_AUTH, JSON.stringify(datosSesion))

      // Redirigir al dashboard
      window.location.href = "dashboard.html"
    } else {
      alert("Usuario, contraseña o rol incorrectos")
    }
  })
}

// Verificar autenticación
function verificarAutenticacion() {
  const datosUsuario = localStorage.getItem(CLAVE_ALMACENAMIENTO_AUTH)

  if (!datosUsuario) {
    window.location.href = "index.html"
    return null
  }

  return JSON.parse(datosUsuario)
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem(CLAVE_ALMACENAMIENTO_AUTH)
  window.location.href = "index.html"
}

// Verificar rol
function tieneRol(rolesPermitidos) {
  const usuario = verificarAutenticacion()
  if (!usuario) return false
  return rolesPermitidos.includes(usuario.rol)
}

window.verificarAutenticacion = verificarAutenticacion
window.cerrarSesion = cerrarSesion
window.tieneRol = tieneRol
