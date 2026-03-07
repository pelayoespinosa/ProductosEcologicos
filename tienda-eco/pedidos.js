const dayjs = require('dayjs');

const IVA = 0.21;

let nombreCliente = 'Pelayo Espinosa';
let direccionCliente = 'Calle Falsa 123';
let telefonoCliente = '123456789';
let subtotal = 132.00;
let fechaEntrega = dayjs().add(3, 'day').format('YYYY-MM-DD');

let stock = true;
let porcentajeDescuento = 0;

const productos = [
    {nombre: 'Producto 1', precio: 50.00, cantidad: 1},
    {nombre: 'Producto 2', precio: 30.00, cantidad: 2},
    {nombre: 'Producto 3', precio: 20.00, cantidad: 1},
    {nombre: 'Producto 4', precio: 10.00, cantidad: 3},
    {nombre: 'Producto 5', precio: 12.00, cantidad: 2},
    {nombre: 'Producto 6', precio: 15.00, cantidad: 1},
    
]; 

let clienteNormaizado = nombreCliente.toUpperCase();
let direccionNormaizada = direccionCliente.toUpperCase();
let telefonoNormaizado = telefonoCliente.toUpperCase();

let tieneFragil = productos.some(producto =>
    producto.nombre.toLowerCase().includes("fragil")
);

function comprobarStock() {
    if (!stock) {
        console.log("No hay stock disponible para este producto.");
        return false;
    } else {
        return productos.every(producto => producto.cantidad > 0);
    }
}

function calcularDescuento(subtotal) {
    if (subtotal >= 100) {
        return porcentajeDescuento = 0.05; // 10% de descuento
    } else {
        return porcentajeDescuento = 0; // Sin descuento
    };
}

function calcularTotal(subtotal, porcentajeDescuento) {
    const descuento = subtotal * porcentajeDescuento;
    const totalConDescuento = subtotal - descuento;
    const totalConIVA = totalConDescuento * (1 + IVA);
    return totalConIVA.toFixed(2);
}

function entregarPedido() {
    if (comprobarStock(productos)) {
        const descuentoAplicado = calcularDescuento(subtotal);
        const total = calcularTotal(subtotal, descuentoAplicado);
        console.log(`Pedido entregado a ${clienteNormaizado} en ${direccionNormaizada}. Total a pagar: €${total}. Fecha de entrega: ${fechaEntrega}`);
    } 
}

const resumenPedido = `
===================================================
Resumen del Pedido:
Cliente: ${clienteNormaizado}
Dirección: ${direccionNormaizada}
Teléfono: ${telefonoNormaizado}
Contiene productos frágiles: ${tieneFragil ? 'Sí' : 'No'}

---Desglose de Productos---
Subtotal: €${subtotal.toFixed(2)}
Descuento aplicado: ${calcularDescuento(subtotal) * 100}%
Subtotal con descuento: €${(subtotal - (subtotal * calcularDescuento(subtotal))).toFixed(2)}
Impuesto (IVA 21%): €${((subtotal - (subtotal * calcularDescuento(subtotal))) * IVA).toFixed(2)}
----------------------------
Total a pagar: €${calcularTotal(subtotal, calcularDescuento(subtotal))}

Fecha de entrega: ${fechaEntrega}
===================================================
`;

console.log(resumenPedido);