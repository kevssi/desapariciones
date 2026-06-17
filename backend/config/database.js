const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'desapariciones',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para migrar la base de datos de forma automática
async function checkAndAlterTable() {
  try {
    // Comprobar si la columna 'verificado' ya existe en 'usuarios'
    const [columns] = await pool.query("SHOW COLUMNS FROM usuarios LIKE 'verificado'");
    if (columns.length === 0) {
      console.log("Añadiendo columnas de verificación de correo a la tabla usuarios...");
      await pool.query("ALTER TABLE usuarios ADD COLUMN verificado TINYINT(1) DEFAULT 0");
      await pool.query("ALTER TABLE usuarios ADD COLUMN codigo_verificacion VARCHAR(6) DEFAULT NULL");
      console.log("Columnas de verificación añadidas con éxito.");
    } else {
      console.log("La tabla usuarios ya cuenta con las columnas de verificación.");
    }
  } catch (err) {
    console.error("Error al verificar/alterar la tabla usuarios:", err);
  }
}

// Ejecutar migración de forma asíncrona
checkAndAlterTable();

module.exports = pool;

