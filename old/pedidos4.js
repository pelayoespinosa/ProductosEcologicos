const dayjs = require('dayjs');
// NUEVO: Importamos la versión de promesas del módulo File System (nativo de Node.js)
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
        throw new Error("Falta de stock en uno o más productos."); // Lanzamos un error real
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

    return `
=========================================
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
// 3. Ejecución Principal (Asíncrona)
// ==========================================
// NUEVO: Función async para manejar procesos que toman tiempo (como leer archivos)
async function procesarCompra() {
    console.log("⏳ Leyendo base de datos e iniciando el procesamiento...\n");

    try {
        // AWAIT pausa la ejecución de esta línea hasta que el archivo se lea por completo
        const datosCrudos = await fs.readFile('./carrito.json', 'utf-8');
        
        // Convertimos el texto del archivo a un array de objetos de JavaScript
        const carrito = JSON.parse(datosCrudos);

        // Pasamos el carrito a nuestra lógica de negocio
        const recibo = generarFactura(cliente, carrito);
        console.log(recibo);

    } catch (error) {
        // Si el archivo no existe, el JSON está mal escrito, o no hay stock, el error cae aquí.
        console.error("❌ OPERACIÓN CANCELADA:");
        console.error("Motivo:", error.message);
    }
}

// Arrancamos el programa
procesarCompra();