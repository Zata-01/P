const ventas = [
  { id: 1, producto: "Laptop HP", cantidad: 2, total: 30000, fecha: "2024-01-15" },
  { id: 2, producto: "Mouse Logitech", cantidad: 3, total: 1050, fecha: "2024-01-15" },
  { id: 3, producto: "Teclado Mecánico", cantidad: 1, total: 1200, fecha: "2024-01-16" },
]

const compras = [
  { id: 1, proveedor: "Distribuidora Central", producto: "Laptop HP", cantidad: 5, total: 60000, fecha: "2024-01-15" },
  { id: 2, proveedor: "Tech Supplies", producto: "Mouse Logitech", cantidad: 20, total: 4000, fecha: "2024-01-14" },
]

const devoluciones = [
  {
    id: 1,
    ticket: "0001",
    producto: "Laptop HP",
    cantidad: 1,
    monto: 15000,
    motivo: "Producto defectuoso",
    fecha: "2024-01-16",
  },
]

const productos = [
  { id: 1, nombre: "Laptop HP", codigo: "LPT001", stock: 10, precio: 15000, categoria: "Computadoras" },
  { id: 2, nombre: "Mouse Logitech", codigo: "MS002", stock: 25, precio: 350, categoria: "Accesorios" },
  { id: 3, nombre: "Teclado Mecánico", codigo: "TEC003", stock: 15, precio: 1200, categoria: "Accesorios" },
]

let datosReporte = []

function verificarAutenticacion() {
  console.log("Verificando autenticación...")
}

document.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacion()

  const hoy = new Date()
  const haceUnMes = new Date(hoy)
  haceUnMes.setMonth(haceUnMes.getMonth() - 1)

  document.getElementById("fechaInicio").valueAsDate = haceUnMes
  document.getElementById("fechaFin").valueAsDate = hoy
})

function generarReporte() {
  const tipoReporte = document.getElementById("tipoReporte").value
  const fechaInicio = new Date(document.getElementById("fechaInicio").value)
  const fechaFin = new Date(document.getElementById("fechaFin").value)

  if (!document.getElementById("fechaInicio").value || !document.getElementById("fechaFin").value) {
    alert("Seleccione un rango de fechas")
    return
  }

  if (fechaInicio > fechaFin) {
    alert("La fecha de inicio no puede ser mayor a la fecha fin")
    return
  }

  switch (tipoReporte) {
    case "ventas":
      generarReporteVentas(fechaInicio, fechaFin)
      break
    case "productos":
      generarReporteProductos(fechaInicio, fechaFin)
      break
    case "compras":
      generarReporteCompras(fechaInicio, fechaFin)
      break
    case "devoluciones":
      generarReporteDevoluciones(fechaInicio, fechaFin)
      break
    case "inventario":
      generarReporteInventario()
      break
  }
}

function generarReporteVentas(fechaInicio, fechaFin) {
  const ventasFiltradas = ventas.filter((v) => {
    const fecha = new Date(v.fecha)
    return fecha >= fechaInicio && fecha <= fechaFin
  })

  datosReporte = ventasFiltradas

  const totalVentas = ventasFiltradas.reduce((sum, v) => sum + v.total, 0)
  const totalTransacciones = ventasFiltradas.length
  const promedio = totalTransacciones > 0 ? totalVentas / totalTransacciones : 0

  document.getElementById("totalPeriodo").textContent = `$${totalVentas.toFixed(2)}`
  document.getElementById("totalTransacciones").textContent = totalTransacciones
  document.getElementById("promedioTransaccion").textContent = `$${promedio.toFixed(2)}`
  document.getElementById("resumenStats").style.display = "grid"

  document.getElementById("tituloReporte").textContent = "Reporte de Ventas"
  const thead = document.getElementById("reporteTableHead")
  thead.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Fecha</th>
        </tr>
    `

  const tbody = document.getElementById("reporteTableBody")
  tbody.innerHTML = ""

  if (ventasFiltradas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay datos para este período</td></tr>'
  } else {
    ventasFiltradas.forEach((venta) => {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>#${venta.id.toString().padStart(4, "0")}</td>
                <td>${venta.producto}</td>
                <td>${venta.cantidad}</td>
                <td>$${venta.total.toFixed(2)}</td>
                <td>${new Date(venta.fecha).toLocaleDateString("es-MX")}</td>
            `
      tbody.appendChild(row)
    })
  }

  document.getElementById("tablaReporte").style.display = "block"
}

function generarReporteProductos(fechaInicio, fechaFin) {
  const ventasFiltradas = ventas.filter((v) => {
    const fecha = new Date(v.fecha)
    return fecha >= fechaInicio && fecha <= fechaFin
  })

  const productosVendidos = {}
  ventasFiltradas.forEach((venta) => {
    if (!productosVendidos[venta.producto]) {
      productosVendidos[venta.producto] = { cantidad: 0, total: 0 }
    }
    productosVendidos[venta.producto].cantidad += venta.cantidad
    productosVendidos[venta.producto].total += venta.total
  })

  datosReporte = Object.entries(productosVendidos)
    .map(([producto, datos]) => ({ producto, ...datos }))
    .sort((a, b) => b.cantidad - a.cantidad)

  document.getElementById("resumenStats").style.display = "none"

  document.getElementById("tituloReporte").textContent = "Productos Más Vendidos"
  const thead = document.getElementById("reporteTableHead")
  thead.innerHTML = `
        <tr>
            <th>Producto</th>
            <th>Cantidad Vendida</th>
            <th>Total Recaudado</th>
        </tr>
    `

  const tbody = document.getElementById("reporteTableBody")
  tbody.innerHTML = ""

  if (datosReporte.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No hay datos para este período</td></tr>'
  } else {
    datosReporte.forEach((item) => {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${item.producto}</td>
                <td>${item.cantidad}</td>
                <td>$${item.total.toFixed(2)}</td>
            `
      tbody.appendChild(row)
    })
  }

  document.getElementById("tablaReporte").style.display = "block"
}

function generarReporteCompras(fechaInicio, fechaFin) {
  const comprasFiltradas = compras.filter((c) => {
    const fecha = new Date(c.fecha)
    return fecha >= fechaInicio && fecha <= fechaFin
  })

  datosReporte = comprasFiltradas

  const totalCompras = comprasFiltradas.reduce((sum, c) => sum + c.total, 0)
  const totalTransacciones = comprasFiltradas.length
  const promedio = totalTransacciones > 0 ? totalCompras / totalTransacciones : 0

  document.getElementById("totalPeriodo").textContent = `$${totalCompras.toFixed(2)}`
  document.getElementById("totalTransacciones").textContent = totalTransacciones
  document.getElementById("promedioTransaccion").textContent = `$${promedio.toFixed(2)}`
  document.getElementById("resumenStats").style.display = "grid"

  document.getElementById("tituloReporte").textContent = "Reporte de Compras"
  const thead = document.getElementById("reporteTableHead")
  thead.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Proveedor</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Fecha</th>
        </tr>
    `

  const tbody = document.getElementById("reporteTableBody")
  tbody.innerHTML = ""

  if (comprasFiltradas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay datos para este período</td></tr>'
  } else {
    comprasFiltradas.forEach((compra) => {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>#${compra.id.toString().padStart(4, "0")}</td>
                <td>${compra.proveedor}</td>
                <td>${compra.producto}</td>
                <td>${compra.cantidad}</td>
                <td>$${compra.total.toFixed(2)}</td>
                <td>${new Date(compra.fecha).toLocaleDateString("es-MX")}</td>
            `
      tbody.appendChild(row)
    })
  }

  document.getElementById("tablaReporte").style.display = "block"
}

function generarReporteDevoluciones(fechaInicio, fechaFin) {
  const devolucionesFiltradas = devoluciones.filter((d) => {
    const fecha = new Date(d.fecha)
    return fecha >= fechaInicio && fecha <= fechaFin
  })

  datosReporte = devolucionesFiltradas

  const totalDevoluciones = devolucionesFiltradas.reduce((sum, d) => sum + d.monto, 0)
  const totalTransacciones = devolucionesFiltradas.length

  document.getElementById("totalPeriodo").textContent = `$${totalDevoluciones.toFixed(2)}`
  document.getElementById("totalTransacciones").textContent = totalTransacciones
  document.getElementById("promedioTransaccion").textContent =
    totalTransacciones > 0 ? `$${(totalDevoluciones / totalTransacciones).toFixed(2)}` : "$0"
  document.getElementById("resumenStats").style.display = "grid"

  document.getElementById("tituloReporte").textContent = "Reporte de Devoluciones"
  const thead = document.getElementById("reporteTableHead")
  thead.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Ticket</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Monto Devuelto</th>
            <th>Motivo</th>
            <th>Fecha</th>
        </tr>
    `

  const tbody = document.getElementById("reporteTableBody")
  tbody.innerHTML = ""

  if (devolucionesFiltradas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay datos para este período</td></tr>'
  } else {
    devolucionesFiltradas.forEach((dev) => {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>#${dev.id.toString().padStart(4, "0")}</td>
                <td>#${dev.ticket}</td>
                <td>${dev.producto}</td>
                <td>${dev.cantidad}</td>
                <td>$${dev.monto.toFixed(2)}</td>
                <td>${dev.motivo}</td>
                <td>${new Date(dev.fecha).toLocaleDateString("es-MX")}</td>
            `
      tbody.appendChild(row)
    })
  }

  document.getElementById("tablaReporte").style.display = "block"
}

function generarReporteInventario() {
  datosReporte = productos

  document.getElementById("resumenStats").style.display = "none"

  document.getElementById("tituloReporte").textContent = "Estado de Inventario"
  const thead = document.getElementById("reporteTableHead")
  thead.innerHTML = `
        <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Stock Actual</th>
            <th>Precio</th>
            <th>Valor en Inventario</th>
            <th>Estado</th>
        </tr>
    `

  const tbody = document.getElementById("reporteTableBody")
  tbody.innerHTML = ""

  productos.forEach((producto) => {
    const valorInventario = producto.stock * producto.precio
    let estado = "Normal"
    let badgeClass = "badge-success"

    if (producto.stock < 5) {
      estado = "Crítico"
      badgeClass = "badge-danger"
    } else if (producto.stock < 10) {
      estado = "Bajo"
      badgeClass = "badge-warning"
    }

    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${producto.codigo}</td>
            <td>${producto.nombre}</td>
            <td>${producto.categoria}</td>
            <td>${producto.stock}</td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td>$${valorInventario.toFixed(2)}</td>
            <td><span class="badge ${badgeClass}">${estado}</span></td>
        `
    tbody.appendChild(row)
  })

  document.getElementById("tablaReporte").style.display = "block"
}

function exportarCSV() {
  if (datosReporte.length === 0) {
    alert("Genere un reporte primero")
    return
  }

  const tipoReporte = document.getElementById("tipoReporte").value
  let csv = ""
  let nombreArchivo = ""

  switch (tipoReporte) {
    case "ventas":
      csv = "ID,Producto,Cantidad,Total,Fecha\n"
      datosReporte.forEach((v) => {
        csv += `${v.id},${v.producto},${v.cantidad},${v.total},${v.fecha}\n`
      })
      nombreArchivo = "reporte_ventas.csv"
      break
    case "productos":
      csv = "Producto,Cantidad Vendida,Total Recaudado\n"
      datosReporte.forEach((p) => {
        csv += `${p.producto},${p.cantidad},${p.total}\n`
      })
      nombreArchivo = "reporte_productos_mas_vendidos.csv"
      break
    case "compras":
      csv = "ID,Proveedor,Producto,Cantidad,Total,Fecha\n"
      datosReporte.forEach((c) => {
        csv += `${c.id},${c.proveedor},${c.producto},${c.cantidad},${c.total},${c.fecha}\n`
      })
      nombreArchivo = "reporte_compras.csv"
      break
    case "devoluciones":
      csv = "ID,Ticket,Producto,Cantidad,Monto,Motivo,Fecha\n"
      datosReporte.forEach((d) => {
        csv += `${d.id},${d.ticket},${d.producto},${d.cantidad},${d.monto},"${d.motivo}",${d.fecha}\n`
      })
      nombreArchivo = "reporte_devoluciones.csv"
      break
    case "inventario":
      csv = "Código,Producto,Categoría,Stock,Precio,Valor en Inventario\n"
      datosReporte.forEach((p) => {
        csv += `${p.codigo},${p.nombre},${p.categoria},${p.stock},${p.precio},${p.stock * p.precio}\n`
      })
      nombreArchivo = "reporte_inventario.csv"
      break
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", nombreArchivo)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
