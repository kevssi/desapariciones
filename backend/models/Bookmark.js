const pool = require('../config/database');

class Bookmark {
  static async save(usuarioId, personaId) {
    const [result] = await pool.query(
      'INSERT IGNORE INTO publicaciones_guardadas (usuario_id, persona_id) VALUES (?, ?)',
      [usuarioId, personaId]
    );
    return result.affectedRows;
  }

  static async unsave(usuarioId, personaId) {
    const [result] = await pool.query(
      'DELETE FROM publicaciones_guardadas WHERE usuario_id = ? AND persona_id = ?',
      [usuarioId, personaId]
    );
    return result.affectedRows;
  }

  static async isSaved(usuarioId, personaId) {
    const [rows] = await pool.query(
      'SELECT id FROM publicaciones_guardadas WHERE usuario_id = ? AND persona_id = ?',
      [usuarioId, personaId]
    );
    return rows.length > 0;
  }

  static async getSavedByUsuario(usuarioId) {
    const [rows] = await pool.query(
      `SELECT pd.*, u.nombre as publicado_por 
       FROM publicaciones_guardadas pg
       JOIN personas_desaparecidas pd ON pg.persona_id = pd.id
       JOIN usuarios u ON pd.usuario_id = u.id
       WHERE pg.usuario_id = ?
       ORDER BY pg.fecha_creacion DESC`,
      [usuarioId]
    );
    return rows;
  }
}

module.exports = Bookmark;
