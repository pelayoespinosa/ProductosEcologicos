// models/Producto.js
const mongoose = require("mongoose");

// 1. Definimos el Esquema (Las reglas de nuestros datos)
const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true, // Es obligatorio
    unique: true, // No puede haber dos productos con el mismo nombre
  },
  precio: {
    type: Number,
    required: true,
    min: 0, // El precio no puede ser negativo
  },
  esFragil: {
    type: Boolean,
    default: false, // Si no decimos nada, asumimos que no es frágil
  },
  stockDisponible: {
    type: Number,
    required: true,
    min: 0,
  },
});

// 2. Exportamos el Modelo para poder usarlo en otras partes del proyecto
module.exports = mongoose.model("Producto", productoSchema);