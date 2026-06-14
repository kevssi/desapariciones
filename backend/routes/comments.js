const express = require('express');
const authMiddleware = require('../middleware/auth');
const Comment = require('../models/Comment');

const router = express.Router();

// Obtener comentarios de una persona
router.get('/:personaId', async (req, res) => {
  try {
    const comments = await Comment.getByPersonaId(req.params.personaId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Crear comentario o respuesta (requiere autenticación)
router.post('/:personaId', authMiddleware, async (req, res) => {
  try {
    const { contenido, parentId } = req.body;
    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ message: 'El comentario no puede estar vacío' });
    }

    const id = await Comment.create(
      req.params.personaId,
      req.userId,
      contenido.trim(),
      parentId || null
    );

    // Devolver el comentario completo con datos del usuario
    const comments = await Comment.getByPersonaId(req.params.personaId);
    const newComment = comments.find(c => c.id === id);

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Editar comentario (solo el autor)
router.put('/:commentId', authMiddleware, async (req, res) => {
  try {
    const { contenido } = req.body;
    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ message: 'El comentario no puede estar vacío' });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }

    // Verificar seguridad: que el usuario que edita sea el autor
    if (comment.usuario_id !== req.userId) {
      return res.status(403).json({ message: 'No autorizado para editar este comentario' });
    }

    await Comment.update(req.params.commentId, contenido.trim());
    res.json({ message: 'Comentario actualizado', contenido: contenido.trim() });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Eliminar comentario (solo el autor)
router.delete('/:commentId', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }

    // Verificar seguridad: que el usuario que elimina sea el autor
    if (comment.usuario_id !== req.userId) {
      return res.status(403).json({ message: 'No autorizado para eliminar este comentario' });
    }

    await Comment.delete(req.params.commentId);
    res.json({ message: 'Comentario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
