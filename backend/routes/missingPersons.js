const express = require('express');
const authMiddleware = require('../middleware/auth');
const MissingPerson = require('../models/MissingPerson');
const Bookmark = require('../models/Bookmark');
const User = require('../models/User');

const router = express.Router();

const validatePersonData = (data, isUpdate = false) => {
  const errors = [];
  const { nombre, apellido, edad, descripcion, fecha_desaparicion, ubicacion, sexo, telefono, foto, estado, senas_particulares } = data;

  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s-]+$/;

  if (!isUpdate || nombre !== undefined) {
    if (!nombre || !nombre.trim() || nombre.length > 15) {
      errors.push('Nombre es requerido y debe ser menor a 15 caracteres');
    } else if (!nameRegex.test(nombre)) {
      errors.push('El nombre no puede contener números ni caracteres especiales');
    }
  }

  if (!isUpdate || apellido !== undefined) {
    if (!apellido || !apellido.trim() || apellido.length > 15) {
      errors.push('Apellido es requerido y debe ser menor a 15 caracteres');
    } else if (!nameRegex.test(apellido)) {
      errors.push('El apellido no puede contener números ni caracteres especiales');
    }
  }

  if (edad !== undefined && edad !== null && edad !== '') {
    const ageVal = parseInt(edad);
    if (isNaN(ageVal) || ageVal < 0 || ageVal > 120) {
      errors.push('Edad debe ser un número entero entre 0 y 120');
    }
  }

  if (!isUpdate || descripcion !== undefined) {
    if (!descripcion || !descripcion.trim()) {
      errors.push('Descripción es requerida');
    } else if (descripcion.length > 500) {
      errors.push('La descripción no puede exceder los 500 caracteres');
    }
  }

  if (senas_particulares !== undefined && senas_particulares !== null) {
    if (senas_particulares.length > 500) {
      errors.push('Las señas particulares no pueden exceder los 500 caracteres');
    }
  }

  if (!isUpdate || fecha_desaparicion !== undefined) {
    if (!fecha_desaparicion) {
      errors.push('Fecha de desaparición es requerida');
    } else {
      const dateVal = new Date(fecha_desaparicion);
      if (isNaN(dateVal.getTime()) || dateVal > new Date()) {
        errors.push('Fecha de desaparición inválida o en el futuro');
      }
    }
  }

  if (!isUpdate || ubicacion !== undefined) {
    if (!ubicacion || !ubicacion.trim() || ubicacion.length > 255) {
      errors.push('Ubicación es requerida y debe ser menor a 255 caracteres');
    }
  }

  if (sexo !== undefined && sexo !== null && sexo.length > 50) {
    errors.push('Sexo debe ser menor a 50 caracteres');
  }

  if (telefono !== undefined && telefono !== null && telefono !== '') {
    if (!/^\d{10}$/.test(telefono)) {
      errors.push('El teléfono de contacto debe tener exactamente 10 dígitos y contener solo números');
    }
  }

  if (foto !== undefined && foto !== null && foto.length > 1000) {
    errors.push('La URL de la foto es demasiado larga (máx 1000)');
  }

  if (estado !== undefined && !['activa', 'encontrada', 'cerrada'].includes(estado)) {
    errors.push('Estado inválido');
  }

  return errors;
};

// Obtener todas las personas desaparecidas
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const persons = await MissingPerson.getAll(limit, offset);
    res.json(persons);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Buscar personas desaparecidas
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const results = await MissingPerson.search(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Obtener publicaciones guardadas del usuario autenticado
router.get('/user/saved', authMiddleware, async (req, res) => {
  try {
    const saved = await Bookmark.getSavedByUsuario(req.userId);
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Obtener persona desaparecida por ID
router.get('/:id', async (req, res) => {
  try {
    const person = await MissingPerson.getById(req.params.id);
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    res.json(person);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Guardar una publicación (favoritos)
router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    await Bookmark.save(req.userId, req.params.id);
    res.json({ message: 'Post saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Eliminar de guardados
router.delete('/:id/save', authMiddleware, async (req, res) => {
  try {
    await Bookmark.unsave(req.userId, req.params.id);
    res.json({ message: 'Post unsaved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verificar si está guardada por el usuario
router.get('/:id/is-saved', authMiddleware, async (req, res) => {
  try {
    const saved = await Bookmark.isSaved(req.userId, req.params.id);
    res.json({ saved });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Crear publicación (requiere autenticación)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const errors = validatePersonData(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Errores de validación', errors });
    }

    const {
      nombre,
      apellido,
      edad,
      descripcion,
      foto,
      fecha_desaparicion,
      ubicacion,
      sexo,
      senas_particulares,
      telefono
    } = req.body;

    const id = await MissingPerson.create({
      usuario_id: req.userId,
      nombre,
      apellido,
      edad,
      descripcion,
      foto,
      fecha_desaparicion,
      ubicacion,
      estado: 'activa',
      sexo,
      senas_particulares,
      telefono
    });

    res.status(201).json({ message: 'Missing person posted', id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Actualizar publicación
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const person = await MissingPerson.getById(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    if (person.usuario_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const errors = validatePersonData(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Errores de validación', errors });
    }

    await MissingPerson.update(req.params.id, req.body);
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Eliminar publicación
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const person = await MissingPerson.getById(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    const userRole = req.user.rol || (await User.findById(req.userId))?.rol;
    if (person.usuario_id !== req.userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await MissingPerson.delete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
