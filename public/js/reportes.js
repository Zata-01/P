let datosActuales = [];
let filtrosActuales = {};

// 1. Obtener Datos
async function generarReporte() {
    const tipo = document.getElementById("tipoReporte").value;
    const inicio = document.getElementById("fechaInicio").value;
    const fin = document.getElementById("fechaFin").value;
    let url = "";
    filtrosActuales = { tipo, inicio, fin };

    if (tipo === "inventario") {
        url = "/api/reportes/inventario";
    } else {
        if (!inicio || !fin) return alert("Seleccione fechas");
        // Ajustar endpoint según el tipo
        const base = tipo === "ventas_det" ? "ventas" : tipo; 
        url = `/api/reportes/${base}?inicio=${inicio}&fin=${fin}`;
    }

    try {
        const res = await fetch(url);
        if(!res.ok) throw new Error("Error en API");
        const data = await res.json();
        
        datosActuales = data;
        renderVistaPrevia(data);
    } catch (e) {
        console.error(e);
        alert("Error: " + e.message);
    }
}

// 2. Renderizar Vista Previa (Simple)
function renderVistaPrevia(data) {
    const container = document.getElementById("tablaContainer");
    document.getElementById("vistaPrevia").style.display = "block";
    
    if (data.length === 0) {
        container.innerHTML = "<p>No hay datos.</p>";
        return;
    }

    const keys = Object.keys(data[0]);
    let html = "<table><thead><tr>";
    keys.forEach(k => html += `<th>${k.toUpperCase().replace(/_/g, ' ')}</th>`);
    html += "</tr></thead><tbody>";
    
    data.forEach(row => {
        html += "<tr>";
        keys.forEach(k => {
            let val = row[k];
            // Formateo simple para vista
            if(k.includes('total') || k.includes('precio') || k.includes('costo')) val = `$${parseFloat(val).toFixed(2)}`;
            html += `<td>${val ?? ''}</td>`;
        });
        html += "</tr>";
    });
    html += "</tbody></table>";
    
    container.innerHTML = html;
}

// 3. IMPRIMIR (Genera el HTML estructurado)
function imprimirReporte() {
    if (datosActuales.length === 0) return alert("Genere un reporte primero.");

    const printDiv = document.getElementById("printableReport");
    const fechaGen = new Date().toLocaleString("es-MX", {year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'});
    const tipoTitulo = document.getElementById("tipoReporte").selectedOptions[0].text;
    
    // Logotipo (puedes usar base64 o una ruta real)
    const logoSrc = "/img/logo.png"; // Asegúrate de tener esta imagen o usa un placeholder

    // Construir Cabecera
    let html = `
        <div class="report-header">
            <div>
                <img src="${logoSrc}" alt="LOGO" class="report-logo" onerror="this.style.display='none'">
            </div>
            <div class="report-info">
                <strong>SEIKO EXPRESS</strong><br>
                Mazatlán, Sinaloa<br>
                Generado: ${fechaGen}
            </div>
        </div>
        
        <div class="report-title">REPORTE DE ${tipoTitulo}</div>
        
        <p><strong>Filtros:</strong> 
           ${filtrosActuales.tipo === 'inventario' ? 'Todo el catálogo activo' : `Del ${filtrosActuales.inicio} al ${filtrosActuales.fin}`}
        </p>
    `;

    // Construir Tabla
    html += `<table class="report-table">
        <thead>
            <tr>`;
    
    // Definir columnas según el tipo (Hardcoded para cumplir especificación exacta)
    let cols = [];
    if(filtrosActuales.tipo === 'inventario') cols = ['codigo_barras', 'nombre', 'precio', 'stock', 'estado'];
    else if(filtrosActuales.tipo === 'ventas') cols = ['id', 'fecha', 'cajero', 'subtotal', 'iva', 'total'];
    // ... agregar lógica para otros tipos si los datos del backend coinciden con las claves
    // Si no coincide exacto, usamos las llaves dinámicas:
    const keys = cols.length > 0 ? cols : Object.keys(datosActuales[0]);

    keys.forEach(k => {
        html += `<th>${k.toUpperCase().replace(/_/g, ' ')}</th>`;
    });
    html += `</tr></thead><tbody>`;

    // Cuerpo y Totales
    let sumaTotal = 0;
    let cantidadTotal = 0;

    datosActuales.forEach(row => {
        html += "<tr>";
        keys.forEach(k => {
            let val = row[k];
            let clase = "col-text";
            
            // Lógica de valores y clases
            if (typeof val === 'number' || k.includes('precio') || k.includes('total') || k.includes('iva') || k.includes('subtotal') || k.includes('costo')) {
                clase = "col-num";
                // Sumar totales si aplica
                if (k === 'total' || k === 'stock' || (filtrosActuales.tipo === 'ventas_det' && k === 'importe')) {
                    sumaTotal += parseFloat(val);
                }
                if (k.includes('precio') || k.includes('total') || k.includes('costo')) {
                    val = parseFloat(val).toFixed(2);
                }
            }
            
            html += `<td class="${clase}">${val ?? ''}</td>`;
        });
        html += "</tr>";
        cantidadTotal++;
    });
    html += `</tbody></table>`;

    // Sección de Totales
    html += `
        <div class="report-totals">
            <p>Registros Listados: ${cantidadTotal}</p>
            ${sumaTotal > 0 ? `<p>Importe/Cantidad Total: ${sumaTotal.toFixed(2)}</p>` : ''}
        </div>
    `;

    // Pie de Página
    html += `
        <div class="report-footer">
            <div class="footer-section">
                Generado por: ${typeof USUARIO_ACTUAL !== 'undefined' ? USUARIO_ACTUAL : 'Sistema'}
            </div>
            <div class="footer-section center">
                <div class="signature-line">Firma / Vo.Bo.</div>
            </div>
            <div class="footer-section" style="text-align:right;">
                <span class="page-number"></span>
            </div>
        </div>
    `;

    printDiv.innerHTML = html;
    window.print();
}

// 4. EXPORTAR CSV (Con BOM y Nombre específico)
function exportarCSV() {
    if (datosActuales.length === 0) return alert("Genere un reporte primero.");

    // Formato de nombre: reporte_TIPO_YYYYMMDD_HHMM.csv
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const MIN = String(now.getMinutes()).padStart(2, '0');
    const filename = `reporte_${filtrosActuales.tipo}_${YYYY}${MM}${DD}_${HH}${MIN}.csv`;

    const keys = Object.keys(datosActuales[0]);
    
    // Header
    let csv = keys.map(k => k.toUpperCase()).join(",") + "\n";

    // Rows
    datosActuales.forEach(row => {
        csv += keys.map(k => {
            let val = row[k] === null ? "" : row[k];
            // Formato decimal sin símbolo $
            if (typeof val === 'number' && (String(val).includes('.'))) {
                val = val.toFixed(2);
            }
            // Escapar comillas
            val = String(val).replace(/"/g, '""');
            return `"${val}"`;
        }).join(",") + "\n";
    });

    // Agregar BOM para UTF-8 (Excel lo necesita para mostrar acentos)
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Exponer globalmente
window.generarReporte = generarReporte;
window.imprimirReporte = imprimirReporte;
window.exportarCSV = exportarCSV;