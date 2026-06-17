const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, nombre, apellido } = req.body;

    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return res.status(400).json({ message: 'Email inválido o demasiado largo (máx 255)' });
    }
    if (password.length < 6 || password.length > 100) {
      return res.status(400).json({ message: 'La contraseña debe tener entre 6 y 100 caracteres' });
    }
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s-]+$/;
    if (nombre.trim().length === 0 || nombre.length > 15 || apellido.trim().length === 0 || apellido.length > 15) {
      return res.status(400).json({ message: 'Nombre y apellido deben ser de entre 1 y 15 caracteres' });
    }
    if (!nameRegex.test(nombre) || !nameRegex.test(apellido)) {
      return res.status(400).json({ message: 'Nombre y apellido no pueden contener números ni caracteres especiales' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const userId = await User.create({ email, password, nombre, apellido });

    const token = jwt.sign(
      { id: userId, email, rol: 'user' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered',
      token,
      userId,
      nombre,
      apellido,
      rol: 'user'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await User.validatePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      userId: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Obtener perfil
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Actualizar perfil
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { nombre, apellido, foto_perfil, bio } = req.body;
    if (!nombre || !apellido) {
      return res.status(400).json({ message: 'Nombre y apellido son requeridos' });
    }

    if (nombre.trim().length === 0 || nombre.length > 15 || apellido.trim().length === 0 || apellido.length > 15) {
      return res.status(400).json({ message: 'Nombre y apellido deben ser de entre 1 y 15 caracteres' });
    }
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s-]+$/;
    if (!nameRegex.test(nombre) || !nameRegex.test(apellido)) {
      return res.status(400).json({ message: 'Nombre y apellido no pueden contener números ni caracteres especiales' });
    }

    if (bio && bio.length > 250) {
      return res.status(400).json({ message: 'La biografía no puede exceder los 250 caracteres' });
    }

    if (foto_perfil && foto_perfil.length > 500) {
      return res.status(400).json({ message: 'La URL de la foto de perfil no puede exceder los 500 caracteres' });
    }

    await User.update(req.userId, { nombre, apellido, foto_perfil, bio });
    res.json({ message: 'Perfil actualizado con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
