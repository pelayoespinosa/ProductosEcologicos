// Cargar las variables de entorno (para leer MONGODB_URI)
require("dotenv").config();

const mongoose = require("mongoose");
// Importamos el modelo que dicta las reglas de nuestros productos
const Producto = require("./models/Producto");

// Nuestros datos iniciales
const productosIniciales = [
  {
    nombre: "Cesta de Verduras Ecológicas",
    precio: 45.0,
    esFragil: false,
    stockDisponible: 50,
  },
  {
    nombre: "Aceite de Oliva Virgen Extra",
    precio: 28.5,
    esFragil: true,
    stockDisponible: 30,
  },
  {
    nombre: "Miel Cruda Orgánica",
    precio: 12.0,
    esFragil: true,
    stockDisponible: 15,
  },
  {
    nombre: "Jabón Artesanal de Lavanda",
    precio: 6.5,
    esFragil: false,
    stockDisponible: 100,
  },
];

async function poblarBaseDeDatos() {
  try {
    console.log("⏳ Conectando a MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🟢 Conexión establecida.");

    // 1. Limpiar la base de datos
    // Usamos deleteMany({}) para borrar todos los productos existentes y evitar duplicados si ejecutamos esto varias veces
    console.log("🧹 Eliminando catálogo antiguo...");
    await Producto.deleteMany({});

    // 2. Insertar los nuevos datos
    console.log("🌱 Sembrando nuevos productos...");
    await Producto.insertMany(productosIniciales);

    console.log("✅ ¡Éxito! Base de datos poblada correctamente.");

    // 3. Desconectar y cerrar el script
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("🔴 Error durante la siembra:", error);
    process.exit(1);
  }
}

// Ejecutamos la función
poblarBaseDeDatos();