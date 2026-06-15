import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="navbar-logo-svg">
            {/* Círculo de radar / búsqueda */}
            <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
            {/* Pin de ubicación */}
            <path d="M20 31C20 31 29 22.5 29 16.5C29 11.25 24.97 7 20 7C15.03 7 11 11.25 11 16.5C11 22.5 20 31 20 31Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Silueta de persona en el centro */}
            <circle cx="20" cy="14" r="2.2" fill="currentColor" />
            <path d="M16.5 20.5C16.5 18.5 18 18 20 18C22 18 23.5 18.5 23.5 20.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <div className="brand-text">
            <span className="brand-text-found">Found</span>
            <span className="brand-text-me">Me</span>
          </div>
        </Link>

        {/* Mobile menu toggle button */}
        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Navigation list */}
        <ul className={`nav-menu ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
          <li><Link to="/">Inicio</Link></li>
          {isAuthenticated ? (
            <>
              <li><Link to="/perfil">Mi Perfil</Link></li>
              <li><Link to="/create" state={location.pathname === '/perfil' ? { from: 'profile' } : undefined}>Publicar</Link></li>
              <li><button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Iniciar Sesión</Link></li>
              <li><Link to="/register">Registrarse</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};
