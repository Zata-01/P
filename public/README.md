# Sistema de Gestión POS - Frontend HTML/CSS/JavaScript

Sistema de punto de venta e inventario completamente en HTML, CSS y JavaScript puro (sin frameworks).

##  Cómo usar

### Opción 1: Abrir directamente en el navegador

Simplemente abre el archivo `index.html` en tu navegador web favorito para iniciar sesión.

### Opción 2: Usar un servidor local

Para una mejor experiencia (especialmente para pruebas de AJAX con tu backend):

\`\`\`bash
# Con Python 3
python -m http.server 8000

# O con Node.js (instala live-server globalmente)
npx live-server
\`\`\`

Luego abre http://localhost:8000 en tu navegador.

## 📁 Estructura del Proyecto

\`\`\`
├── index.html          # Página de login
├── dashboard.html      # Panel principal
├── productos.html      # Gestión de productos
├── ventas.html         # Punto de venta
├── compras.html        # Registro de compras
├── devoluciones.html   # Gestión de devoluciones
├── reportes.html       # Reportes y exportación
├── usuarios.html       # Administración de usuarios (solo admin)
├── styles.css          # Estilos globales
├── auth.js            # Lógica de autenticación
├── dashboard.js       # Lógica del dashboard
├── productos.js       # Lógica de productos
├── ventas.js          # Lógica de ventas
├── compras.js         # Lógica de compras
├── devoluciones.js    # Lógica de devoluciones
├── reportes.js        # Lógica de reportes
└── usuarios.js        # Lógica de usuarios
\`\`\`

## 🔐 Credenciales de Prueba

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`
- Acceso completo a todas las secciones

**Operador:**
- Usuario: `operador`
- Contraseña: `op123`
- Acceso solo a ventas y devoluciones

## ✨ Funcionalidades

### Para Administradores:
- ✅ Gestión completa de productos (crear, editar, eliminar)
- ✅ Punto de venta con código de barras
- ✅ Registro de compras a proveedores
- ✅ Gestión de devoluciones
- ✅ Reportes con exportación a CSV
- ✅ Administración de usuarios

### Para Operadores:
- ✅ Punto de venta con código de barras
- ✅ Gestión de devoluciones

## 🔌 Conexión con tu Backend

El proyecto viene con datos de prueba (mock data). Para conectarlo con tu backend MySQL:

1. **Busca las funciones que tienen datos mock** (busca comentarios como `// DATOS DE PRUEBA`)

2. **Reemplaza con llamadas AJAX a tu API**. Ejemplo:

\`\`\`javascript
// En productos.js
async function cargarProductos() {
    try {
        const respuesta = await fetch('http://tu-api.com/productos');
        const productos = await respuesta.json();
        // ... resto del código
    } catch (error) {
        console.error('Error:', error);
    }
}
\`\`\`

3. **Archivos que necesitas modificar:**
   - `auth.js` - Conectar con tu sistema de autenticación
   - `productos.js` - CRUD de productos
   - `ventas.js` - Registrar ventas
   - `compras.js` - Registrar compras
   - `devoluciones.js` - Gestionar devoluciones
   - `reportes.js` - Obtener datos para reportes
   - `usuarios.js` - Gestión de usuarios

## 🎨 Características del Diseño

- 📱 **Responsive**: Funciona en móviles, tablets y escritorio
- 🎨 **Tema claro/oscuro**: Cambia automáticamente según preferencia del sistema
- 🖨️ **Impresión de tickets**: Optimizado para impresoras térmicas
- ⚡ **Sin dependencias**: No requiere instalación de paquetes
- 🌐 **100% Cliente**: Todo el código corre en el navegador

## 📝 Notas Importantes

- Los datos se almacenan en `localStorage` solo para pruebas
- En producción, todas las operaciones deben conectarse a tu backend
- Las variables están en español para facilitar la comprensión
- El código está comentado para ayudar en la integración

## 🔧 Próximos Pasos

1. Configura tu backend con MySQL
2. Crea endpoints REST para cada funcionalidad
3. Reemplaza los datos mock con llamadas a tu API
4. Agrega validación y manejo de errores apropiados
5. Implementa autenticación JWT o sesiones

## 📞 Soporte

Si tienes preguntas sobre la integración con tu backend MySQL, revisa los comentarios en el código que indican dónde hacer las conexiones.
