const dayjs = require('dayjs');
const fs = require('fs/promises'); 

// ==========================================
// 1. Configuración Fija
// ==========================================
const CONFIG = {
    iva: 0.21,
    descuentoUmbral: 100,
    descuentoPorcentaje: 0.05,
    costeEnvio: 5.99,
    envioGratisUmbral: 50
};

const cliente = {
    nombre: "maría lópez",
    email: "maria@example.com"
};

// ==========================================
// 2. Funciones Modulares de Negocio
// ==========================================
function validarStock(items) {
    return items.every(item => item.stockDisponible >= item.cantidad);
}

function calcularSubtotal(items) {
    return items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
}

function calcularEnvio(subtotal) {
    return subtotal >= CONFIG.envioGratisUmbral ? 0 : CONFIG.costeEnvio;
}

function generarFactura(clienteData, items) {
    if (!validarStock(items)) {
        throw new Error("Falta de stock en uno o más productos. Revisa el inventario."); 
    }

    const subtotal = calcularSubtotal(items);
    const tieneFragil = items.some(item => item.esFragil);
    
    let descuento = subtotal > CONFIG.descuentoUmbral ? (subtotal * CONFIG.descuentoPorcentaje) : 0;
    const subtotalConDescuento = subtotal - descuento;

    const impuestos = subtotalConDescuento * CONFIG.iva;
    const gastosEnvio = calcularEnvio(subtotalConDescuento);
    const total = subtotalConDescuento + impuestos + gastosEnvio;

    const fechaEntrega = dayjs().add(3, 'day').format('DD/MM/YYYY');
    const nombresProductos = items.map(p => `${p.cantidad}x ${p.nombre}`).join("\n  - ");

    return `=========================================
🌱 TIENDA ECO - FACTURA OFICIAL 🌱
=========================================
👤 Cliente: ${clienteData.nombre.toUpperCase()}
📧 Contacto: ${clienteData.email}

📦 Productos:
  - ${nombresProductos}
⚠️ Embalaje especial: ${tieneFragil ? "SÍ (Precaución: Frágil)" : "No"}

--- Desglose ---
Subtotal: ${subtotal.toFixed(2)}€
Descuento: -${descuento.toFixed(2)}€
Base Imponible: ${subtotalConDescuento.toFixed(2)}€
IVA (21%): +${impuestos.toFixed(2)}€
Envío: ${gastosEnvio === 0 ? "GRATIS" : `+${gastosEnvio.toFixed(2)}€`}
-----------------------------------------
💶 TOTAL A PAGAR: ${total.toFixed(2)}€
=========================================
🚚 Entrega estimada: ${fechaEntrega}
=========================================
`;
}

// ==========================================
// 3. Ejecución Principal (Lectura y Escritura)
// ==========================================
async function procesarCompra() {
    console.log("⏳ Iniciando el sistema de facturación...\n");

    try {
        // 1. LEER los datos del carrito
        console.log("📂 Leyendo base de datos (carrito.json)...");
        const datosCrudos = await fs.readFile('./carrito.json', 'utf-8');
        const carrito = JSON.parse(datosCrudos);

        // 2. PROCESAR la lógica matemática y generar el texto
        console.log("⚙️ Calculando impuestos y fechas...");
        const reciboTexto = generarFactura(cliente, carrito);

        // 3. MOSTRAR en consola (opcional, para confirmar visualmente)
        console.log(reciboTexto);

        // 4. GUARDAR el resultado en un archivo de texto
        // Reemplazamos los espacios del nombre por guiones para el nombre del archivo
        const nombreFormateado = cliente.nombre.replace(/ /g, '-').toLowerCase();
        const nombreArchivo = `factura-${nombreFormateado}.txt`;
        
        console.log("💾 Guardando la factura en el disco duro...");
        await fs.writeFile(`./${nombreArchivo}`, reciboTexto, 'utf-8');
        
        console.log(`✅ ¡Éxito! La factura se ha guardado correctamente como '${nombreArchivo}'.`);

    } catch (error) {
        console.error("\n❌ OPERACIÓN CANCELADA:");
        console.error("Motivo:", error.message);
    }
}

// Arrancamos el programa
procesarCompra();