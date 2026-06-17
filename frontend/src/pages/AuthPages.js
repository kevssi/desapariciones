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

  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

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
        apellido: response.data.apellido,
        rol: response.data.rol
      }, response.data.token);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.needsVerification) {
        setShowVerification(true);
        setError('');
      } else {
        setError(err.response?.data?.message || 'Error en el login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.verify(email, verificationCode);
      login({ 
        id: response.data.userId, 
        email, 
        nombre: response.data.nombre, 
        apellido: response.data.apellido,
        rol: response.data.rol
      }, response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al verificar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setResendMessage('');
    setResendLoading(true);
    try {
      const response = await authService.resendCode(email);
      setResendMessage(response.data.message || 'Código reenviado con éxito.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reenviar el código');
    } finally {
      setResendLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="auth-container">
        <div className="auth-header-nav">
          <button onClick={() => setShowVerification(false)} className="auth-back-btn" title="Volver al inicio de sesión">
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
          <div className="auth-breadcrumb">
            <Link to="/" className="auth-breadcrumb-link">Inicio</Link>
            <span className="auth-breadcrumb-sep">›</span>
            <span className="auth-breadcrumb-current">Verificar Cuenta</span>
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
          <h1>Verificar Cuenta</h1>
          <p className="auth-help-text" style={{ fontSize: '14px', color: '#666', marginBottom: '20px', textAlign: 'center' }}>
            Hemos enviado un código de verificación de 6 dígitos a su correo electrónico: <strong style={{ color: '#2b7d9e' }}>{email}</strong>
          </p>
          {error && <div className="error-message">{error}</div>}
          {resendMessage && <div className="success-message" style={{ backgroundColor: '#e6fffa', color: '#234e52', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', border: '1px solid #b2f5ea', textAlign: 'center' }}>{resendMessage}</div>}
          
          <form onSubmit={handleVerify}>
            <input
              type="text"
              placeholder="Código de 6 dígitos"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '4px', fontWeight: 'bold' }}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar Cuenta'}
            </button>
          </form>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', fontSize: '14px' }}>
            <button 
              type="button" 
              onClick={handleResendCode} 
              disabled={resendLoading}
              style={{ background: 'none', border: 'none', color: '#2b7d9e', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              {resendLoading ? 'Reenviando...' : 'Reenviar código de verificación'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowVerification(false)} 
              style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 0 }}
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'nombre' || name === 'apellido') {
      value = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s-]/g, '').slice(0, 15);
    }
    setFormData({
      ...formData,
      [name]: value
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
      if (response.data.needsVerification) {
        setShowVerification(true);
        setError('');
      } else {
        login({ id: response.data.userId, ...formData, rol: response.data.rol || 'user' }, response.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.verify(formData.email, verificationCode);
      login({ 
        id: response.data.userId, 
        email: formData.email, 
        nombre: response.data.nombre, 
        apellido: response.data.apellido,
        rol: response.data.rol
      }, response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al verificar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setResendMessage('');
    setResendLoading(true);
    try {
      const response = await authService.resendCode(formData.email);
      setResendMessage(response.data.message || 'Código reenviado con éxito.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reenviar el código');
    } finally {
      setResendLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="auth-container">
        <div className="auth-header-nav">
          <button onClick={() => setShowVerification(false)} className="auth-back-btn" title="Volver al registro">
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
          <div className="auth-breadcrumb">
            <Link to="/" className="auth-breadcrumb-link">Inicio</Link>
            <span className="auth-breadcrumb-sep">›</span>
            <span className="auth-breadcrumb-current">Verificar Cuenta</span>
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
          <h1>Verificar Cuenta</h1>
          <p className="auth-help-text" style={{ fontSize: '14px', color: '#666', marginBottom: '20px', textAlign: 'center' }}>
            Hemos enviado un código de verificación de 6 dígitos a su correo electrónico: <strong style={{ color: '#2b7d9e' }}>{formData.email}</strong>
          </p>
          {error && <div className="error-message">{error}</div>}
          {resendMessage && <div className="success-message" style={{ backgroundColor: '#e6fffa', color: '#234e52', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', border: '1px solid #b2f5ea', textAlign: 'center' }}>{resendMessage}</div>}
          
          <form onSubmit={handleVerify}>
            <input
              type="text"
              placeholder="Código de 6 dígitos"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '4px', fontWeight: 'bold' }}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar Cuenta'}
            </button>
          </form>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', fontSize: '14px' }}>
            <button 
              type="button" 
              onClick={handleResendCode} 
              disabled={resendLoading}
              style={{ background: 'none', border: 'none', color: '#2b7d9e', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              {resendLoading ? 'Reenviando...' : 'Reenviar código de verificación'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowVerification(false)} 
              style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 0 }}
            >
              Volver al registro
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            maxLength="15"
            required
          />
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={handleChange}
            maxLength="15"
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
