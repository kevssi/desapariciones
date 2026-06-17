const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password, nombre, apellido, codigo_verificacion } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (email, password, nombre, apellido, verificado, codigo_verificacion) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, nombre, apellido, 0, codigo_verificacion || null]
    );

    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT id, email, nombre, apellido, foto_perfil, bio, fecha_creacion, rol, verificado FROM usuarios WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, userData) {
    const { nombre, apellido, foto_perfil, bio } = userData;
    const [result] = await pool.query(
      'UPDATE usuarios SET nombre = ?, apellido = ?, foto_perfil = ?, bio = ? WHERE id = ?',
      [nombre, apellido, foto_perfil, bio, id]
    );
    return result.affectedRows;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async verifyCode(email, code) {
    // Buscar usuario con el email y el código
    const [rows] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ? AND codigo_verificacion = ?',
      [email, code]
    );

    if (rows.length === 0) {
      return false;
    }

    // Marcar como verificado y vaciar el código
    await pool.query(
      'UPDATE usuarios SET verificado = 1, codigo_verificacion = NULL WHERE email = ?',
      [email]
    );
    
    return rows[0].id;
  }

  static async updateVerificationCode(email, code) {
    const [result] = await pool.query(
      'UPDATE usuarios SET codigo_verificacion = ? WHERE email = ?',
      [code, email]
    );
    return result.affectedRows;
  }
}

module.exports = User;
