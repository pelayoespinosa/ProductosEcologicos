const express = require('express'); 
const dayjs = require('dayjs');
const fs = require('fs/promises'); 

const app = express();
const PORT = 3000;

// ==========================================
// ¡NUEVO!: Middleware indispensable para POST
// ==========================================
// Esto le dice a Express: "Si te envían un JSON oculto en el Body, tradúcelo para que yo pueda leerlo en req.body"
app.use(express.json());
app.use(express.static('public'));

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

// RUTA GET: Lee desde un archivo local (la que ya teníamos)
app.get('/factura/:archivo', async (req, res) => {
     const nombreArchivo = req.params.archivo + '.json';
        
        // NUEVO: Extraemos los datos de la URL (req.query)
        // Si el usuario no los pone, usamos "Cliente Anónimo" y "No especificado" por defecto
        const nombreCliente = req.query.nombre || "Cliente Anónimo";
        const emailCliente = req.query.email || "No especificado";
    
        // Creamos el objeto cliente dinámicamente
        const cliente = {
            nombre: nombreCliente,
            email: emailCliente
        };
    
        console.log(`🌐 Generando factura de ${nombreArchivo} para: ${cliente.nombre}`);
    
        try {
            const datosCrudos = await fs.readFile(`./${nombreArchivo}`, 'utf-8');
            const carrito = JSON.parse(datosCrudos);
    
            const reciboTexto = generarFactura(cliente, carrito);
    
            res.send(`<pre style="font-family: monospace; background: #f4f4f4; padding: 20px; border-radius: 8px;">${reciboTexto}</pre>`);
    
        } catch (error) {
            if (error.code === 'ENOENT') {
                res.status(404).send('<h1>❌ Error 404</h1><p>El carrito solicitado no existe en la base de datos.</p>');
            } else {
                res.status(400).send(`<h1>❌ Operación denegada</h1><p>${error.message}</p>`);
            }
        }
    });


// NUEVA RUTA POST: Recibe los datos directamente del Frontend
app.post('/factura', (req, res) => {
    console.log("📥 Petición POST recibida con un nuevo carrito");

    try {
        // Capturamos los datos que vienen ocultos en el "Body" de la petición
        const cliente = req.body.cliente;
        const carrito = req.body.carrito;

        // Validamos que el usuario nos haya enviado la información necesaria
        if (!cliente || !carrito || !Array.isArray(carrito)) {
            return res.status(400).json({ error: "Faltan datos del cliente o el carrito no es válido." });
        }

        console.log(`Generando factura al vuelo para: ${cliente.nombre}`);

        // Procesamos la factura usando los datos recibidos (ya no leemos archivos .json)
        const reciboTexto = generarFactura(cliente, carrito);

        // Devolvemos la respuesta en formato JSON puro, como hacen las APIs reales
        res.status(200).json({
            mensaje: "Factura generada con éxito",
            ticket: reciboTexto
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ==========================================
// 4. Iniciar el Servidor Web
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express encendido y a la escucha en el puerto ${PORT}...`);
});