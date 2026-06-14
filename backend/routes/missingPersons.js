const express = require('express');
const authMiddleware = require('../middleware/auth');
const MissingPerson = require('../models/MissingPerson');
const Bookmark = require('../models/Bookmark');

const router = express.Router();

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

    if (person.usuario_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await MissingPerson.delete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
