import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();



  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      login({ 
        id: response.data.userId, 
        email, 
        nombre: response.data.nombre, 
        apellido: response.data.apellido 
      }, response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Auth navigation with back arrow and breadcrumb */}
      <div className="auth-header-nav">
        <button onClick={() => navigate('/')} className="auth-back-btn" title="Volver al inicio">
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>
        <div className="auth-breadcrumb">
          <Link to="/" className="auth-breadcrumb-link">Inicio</Link>
          <span className="auth-breadcrumb-sep">›</span>
          <span className="auth-breadcrumb-current">Iniciar Sesión</span>
        </div>
      </div>

      <div className="auth-background-ambient">
        <div className="ambient-blob blob-1"></div>
        <div className="ambient-blob blob-2"></div>
        <div className="ambient-blob blob-3"></div>
        <div className="ambient-blob blob-4"></div>
      </div>

      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      <div className="auth-box">
        <div className="auth-brand-logo">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-logo-svg">
            <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
            <path d="M20 31C20 31 29 22.5 29 16.5C29 11.25 24.97 7 20 7C15.03 7 11 11.25 11 16.5C11 22.5 20 31 20 31Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="14" r="2.2" fill="currentColor" />
            <path d="M16.5 20.5C16.5 18.5 18 18 20 18C22 18 23.5 18.5 23.5 20.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <div className="brand-text">
            <span className="brand-text-found">Found</span>
            <span className="brand-text-me">Me</span>
          </div>
        </div>
        <h1>Iniciar Sesión</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
        <p>
          ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.register(
        formData.email,
        formData.password,
        formData.nombre,
        formData.apellido
      );
      login({ id: response.data.userId, ...formData }, response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Auth navigation with back arrow and breadcrumb */}
      <div className="auth-header-nav">
        <button onClick={() => navigate('/')} className="auth-back-btn" title="Volver al inicio">
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>
        <div className="auth-breadcrumb">
          <Link to="/" className="auth-breadcrumb-link">Inicio</Link>
          <span className="auth-breadcrumb-sep">›</span>
          <span className="auth-breadcrumb-current">Registro</span>
        </div>
      </div>

      <div className="auth-background-ambient">
        <div className="ambient-blob blob-1"></div>
        <div className="ambient-blob blob-2"></div>
        <div className="ambient-blob blob-3"></div>
        <div className="ambient-blob blob-4"></div>
      </div>

      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      <div className="auth-box">
        <div className="auth-brand-logo">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-logo-svg">
            <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
            <path d="M20 31C20 31 29 22.5 29 16.5C29 11.25 24.97 7 20 7C15.03 7 11 11.25 11 16.5C11 22.5 20 31 20 31Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="14" r="2.2" fill="currentColor" />
            <path d="M16.5 20.5C16.5 18.5 18 18 20 18C22 18 23.5 18.5 23.5 20.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <div className="brand-text">
            <span className="brand-text-found">Found</span>
            <span className="brand-text-me">Me</span>
          </div>
        </div>
        <h1>Crear Cuenta</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </form>
        <p>
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
};
