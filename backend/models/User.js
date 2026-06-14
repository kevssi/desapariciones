const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password, nombre, apellido } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (email, password, nombre, apellido) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, nombre, apellido]
    );

    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT id, email, nombre, apellido, foto_perfil, bio, fecha_creacion FROM usuarios WHERE id = ?', [id]);
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
}

module.exports = User;
