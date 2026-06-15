const pool = require('../config/database');

class MissingPerson {
  static async create(personData) {
    const {
      usuario_id,
      nombre,
      apellido,
      edad,
      descripcion,
      foto,
      fecha_desaparicion,
      ubicacion,
      estado,
      sexo,
      senas_particulares,
      telefono
    } = personData;

    const [result] = await pool.query(
      `INSERT INTO personas_desaparecidas 
       (usuario_id, nombre, apellido, edad, descripcion, foto, fecha_desaparicion, ubicacion, estado, sexo, senas_particulares, telefono)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario_id,
        nombre,
        apellido,
        edad || null,
        descripcion,
        foto || null,
        fecha_desaparicion,
        ubicacion,
        estado,
        sexo || null,
        senas_particulares || null,
        telefono || null
      ]
    );

    return result.insertId;
  }

  static async getAll(limit = 20, offset = 0) {
    const [rows] = await pool.query(
      `SELECT pd.*, u.nombre as publicado_por 
       FROM personas_desaparecidas pd
       JOIN usuarios u ON pd.usuario_id = u.id
       ORDER BY pd.fecha_creacion DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT pd.*, u.nombre as publicado_por, u.email 
       FROM personas_desaparecidas pd
       JOIN usuarios u ON pd.usuario_id = u.id
       WHERE pd.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async update(id, personData) {
    const allowedFields = [
      'nombre',
      'apellido',
      'edad',
      'descripcion',
      'foto',
      'fecha_desaparicion',
      'ubicacion',
      'estado',
      'sexo',
      'senas_particulares',
      'telefono'
    ];

    const fields = [];
    const values = [];

    Object.entries(personData).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return 0;

    values.push(id);

    const [result] = await pool.query(
      `UPDATE personas_desaparecidas SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM personas_desaparecidas WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async search(query) {
    const [rows] = await pool.query(
      `SELECT pd.*, u.nombre as publicado_por 
       FROM personas_desaparecidas pd
       JOIN usuarios u ON pd.usuario_id = u.id
       WHERE pd.nombre LIKE ? OR pd.apellido LIKE ? OR pd.descripcion LIKE ?
       ORDER BY pd.fecha_creacion DESC`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return rows;
  }
}

module.exports = MissingPerson;
