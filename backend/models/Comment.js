const pool = require('../config/database');

class Comment {
  static async getByPersonaId(personaId) {
    const [rows] = await pool.query(
      `SELECT c.*, u.nombre, u.apellido
       FROM comentarios c
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.persona_id = ?
       ORDER BY c.fecha_creacion ASC`,
      [personaId]
    );
    return rows;
  }

  static async create(personaId, usuarioId, contenido, parentId = null) {
    const [result] = await pool.query(
      'INSERT INTO comentarios (persona_id, usuario_id, contenido, parent_id) VALUES (?, ?, ?, ?)',
      [personaId, usuarioId, contenido, parentId]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM comentarios WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, contenido) {
    const [result] = await pool.query(
      'UPDATE comentarios SET contenido = ? WHERE id = ?',
      [contenido, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM comentarios WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Comment;
