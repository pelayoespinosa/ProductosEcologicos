const express = require('express'); // NUEVO: Importamos Express
const dayjs = require('dayjs');
const fs = require('fs/promises'); 

// Inicializamos la aplicación de Express
const app = express();
const PORT = 3000;

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

// ==========================================
// 2. Funciones Modulares de Negocio (Intactas)
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
=========================================`;
}

// ==========================================
// 3. Rutas de nuestra API web (Endpoints)
// ==========================================

// Atendemos peticiones GET en la ruta dinámica /factura/:archivo
// El ":archivo" funciona como una variable en la URL
app.get('/factura/:archivo', async (req, res) => {
    
    // Capturamos el nombre que el usuario ponga en la URL y le añadimos .json
    const nombreArchivo = req.params.archivo + '.json';
    console.log(`🌐 Petición recibida desde el navegador para: ${nombreArchivo}`);

    // Datos del cliente simulados por ahora
    const cliente = {
        nombre: "maría lópez",
        email: "maria@example.com"
    };

    try {
        // Leemos la base de datos
        const datosCrudos = await fs.readFile(`./${nombreArchivo}`, 'utf-8');
        const carrito = JSON.parse(datosCrudos);

        // Procesamos la factura
        const reciboTexto = generarFactura(cliente, carrito);

        // RESPONDEMOS AL NAVEGADOR
        // Usamos la etiqueta HTML <pre> para que el navegador respete los espacios y saltos de línea de nuestro texto
        res.send(`<pre style="font-family: monospace; background: #f4f4f4; padding: 20px; border-radius: 8px;">${reciboTexto}</pre>`);

    } catch (error) {
        // Manejo de errores profesional devolviendo códigos de estado HTTP
        if (error.code === 'ENOENT') {
            // ENOENT = Error No Entity (El archivo no existe)
            res.status(404).send('<h1>❌ Error 404</h1><p>El carrito solicitado no existe en la base de datos.</p>');
        } else {
            // Otros errores (como falta de stock)
            res.status(400).send(`<h1>❌ Operación denegada</h1><p>${error.message}</p>`);
        }
    }
});

// ==========================================
// 4. Iniciar el Servidor Web
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express encendido y a la escucha...`);
    console.log(`👉 Entra en tu navegador web y visita: http://localhost:${PORT}/factura/carrito`);
    console.log(`👉 O si creaste el segundo archivo: http://localhost:${PORT}/factura/cliente2`);
});