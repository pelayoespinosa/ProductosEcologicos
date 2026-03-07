// Importamos la librería dayjs
const dayjs = require('dayjs');

// ==========================================
// 1. Declaración de Variables y Constantes
// ==========================================
const IVA = 0.21; 
let nombreCliente = "maría lópez";
let hayStock = true;

// NUEVO: Array de Objetos para el carrito
// Ahora cada producto tiene múltiples propiedades
const carrito = [
    { nombre: "Cesta de Verduras Ecológicas", precio: 45.00, cantidad: 1, esFragil: false },
    { nombre: "Aceite de Oliva Virgen Extra", precio: 28.50, cantidad: 2, esFragil: true },
    { nombre: "Miel Cruda Orgánica", precio: 12.00, cantidad: 1, esFragil: true }
];

// ==========================================
// 2. Manipulación de Datos
// ==========================================
// Normalizar el nombre a mayúsculas
let clienteNormalizado = nombreCliente.toUpperCase();

// NUEVO: Calcular el subtotal automáticamente recorriendo el carrito
let subtotal = 0;
carrito.forEach(producto => {
    subtotal += producto.precio * producto.cantidad; // (45*1) + (28.5*2) + (12*1) = 114€
});

// NUEVO: Usamos el método .some() para buscar si *algún* producto del carrito es frágil
let tieneFragil = carrito.some(producto => producto.esFragil === true);

// ==========================================
// 3. Control de Flujo (Validación y Descuento)
// ==========================================
if (!hayStock) {
    console.log("❌ Error: Algunos productos no están en stock. Pedido cancelado.");
    process.exit(); 
}

// Lógica del descuento (5% si supera 100€)
let porcentajeDescuento = 0;
if (subtotal > 100) {
    porcentajeDescuento = 0.05; 
}

// ==========================================
// 4. Cálculos Aritméticos
// ==========================================
let descuentoAplicado = subtotal * porcentajeDescuento;
let subtotalConDescuento = subtotal - descuentoAplicado;

// Fórmula final: Total = Subtotal * (1 + IVA)
let total = subtotalConDescuento * (1 + IVA);

// ==========================================
// 5. Fechas con dayjs
// ==========================================
// Sumamos 3 días a la fecha actual para la entrega
let fechaEntrega = dayjs().add(3, 'day').format('DD/MM/YYYY');

// ==========================================
// 6. Template Literals (Resumen en consola)
// ==========================================

// NUEVO: Creamos una lista en texto de los productos para mostrarla ("1x Cesta, 2x Aceite...")
const nombresProductos = carrito.map(p => `${p.cantidad}x ${p.nombre}`).join("\n  - ");

const resumenPedido = `
=========================================
🌱 TIENDA ECO - RESUMEN DEL PEDIDO 🌱
=========================================
👤 Cliente: ${clienteNormalizado}
📦 Productos en el carrito:
  - ${nombresProductos}

⚠️ Embalaje especial por productos frágiles: ${tieneFragil ? "SÍ REQUERIDO" : "No necesario"}

--- Desglose de Facturación ---
Subtotal inicial: ${subtotal.toFixed(2)}€
Descuento aplicado (${porcentajeDescuento * 100}%): -${descuentoAplicado.toFixed(2)}€
Subtotal tras descuento: ${subtotalConDescuento.toFixed(2)}€
Impuestos (IVA 21%): ${(subtotalConDescuento * IVA).toFixed(2)}€
-----------------------------------------
💶 TOTAL A PAGAR: ${total.toFixed(2)}€
=========================================
🚚 Fecha estimada de entrega: ${fechaEntrega}
=========================================
`;

// Mostrar en consola
console.log(resumenPedido);
