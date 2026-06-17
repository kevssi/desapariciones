import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { missingPersonsService } from '../services/api';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  MapPin, 
  Share2, 
  MessageSquare, 
  AlertCircle, 
  PlusCircle, 
  ArrowRight,
  User,
  CheckCircle2,
  FolderHeart,
  ShieldAlert,
  AlertTriangle,
  Globe,
  Folder
} from 'lucide-react';
import './Home.css';

const statusConfig = {
  activa: { label: 'En búsqueda', color: '#e74c3c', bg: '#fdecea' },
  encontrada: { label: 'Encontrado/a ✓', color: '#27ae60', bg: '#eafaf1' },
  cerrada: { label: 'Caso cerrado', color: '#7f8c8d', bg: '#f2f3f4' }
};

export const HomePage = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { resetBreadcrumb } = useBreadcrumb();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    resetBreadcrumb();
  }, []); // eslint-disable-line

  const triggerSearch = async (query) => {
    try {
      setLoading(true);
      if (!query.trim()) {
        const response = await missingPersonsService.getAll();
        setPersons(response.data);
      } else {
        const response = await missingPersonsService.search(query);
        setPersons(response.data);
      }
    } catch (error) {
      console.error('Error fetching/searching persons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search === '') {
      triggerSearch('');
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      triggerSearch(search);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    triggerSearch(search);
  };

  const myPersons = persons.filter(p => p.usuario_id === user?.id);
  const activeCasesCount = persons.filter(p => p.estado === 'activa').length;
  const foundCasesCount = persons.filter(p => p.estado === 'encontrada').length;

  const displayedPersons = activeTab === 'my' ? myPersons : persons;

  return (
    <div className="home-page">
      {isAuthenticated ? (
        /* ================= AUTHENTICATED USER DASHBOARD VIEW ================= */
        <>
          {/* Ambient Background Blobs for Dashboard */}
          <div className="landing-background-ambient">
            <div className="landing-blob landing-blob-1"></div>
            <div className="landing-blob landing-blob-2"></div>
          </div>

          <section className="dashboard-hero">
            <div className="dashboard-welcome">
              <div className="user-profile-badge">
                <User size={26} />
              </div>
              <div className="welcome-text">
                <h1>Hola, {user?.nombre || 'Usuario'}</h1>
                <p>Panel de Control Solidario • Ayúdanos a encontrarles</p>
              </div>
            </div>
            
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon-wrapper red">
                  <AlertCircle size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{activeCasesCount}</span>
                  <span className="stat-label">Búsquedas Activas</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper green">
                  <CheckCircle2 size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{foundCasesCount}</span>
                  <span className="stat-label">Localizados/as</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper blue">
                  <FolderHeart size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{myPersons.length}</span>
                  <span className="stat-label">Mis Reportes</span>
                </div>
              </div>
            </div>
          </section>

          <div className="dashboard-content-layout">
            <div className="dashboard-main-column">
              {/* Tabs Navigation */}
              <div className="dashboard-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  <Globe size={18} /> Todos los Reportes ({persons.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
                  onClick={() => setActiveTab('my')}
                >
                  <Folder size={18} /> Mis Reportes ({myPersons.length})
                </button>
              </div>

              {/* Search Container */}
              <div className="search-container dashboard-search">
                <form onSubmit={handleSearch}>
                  <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, apellido o ubicación..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="search-btn">Buscar</button>
                  {search && (
                    <button type="button" className="clear-btn" onClick={() => { setSearch(''); }}>
                      Limpiar
                    </button>
                  )}
                </form>
              </div>

              {/* Cases Grid */}
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Cargando reportes...</p>
                </div>
              ) : displayedPersons.length === 0 ? (
                <div className="dashboard-empty-state">
                  <FolderHeart size={48} className="empty-icon" />
                  {activeTab === 'my' ? (
                    <>
                      <h3>No tienes publicaciones aún</h3>
                      <p>Si necesitas reportar o difundir la búsqueda de un ser querido, puedes crear una nueva publicación aquí.</p>
                      <Link to="/create" className="btn-hero-primary">
                        <PlusCircle size={18} /> Crear una publicación
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3>No se encontraron resultados</h3>
                      <p>Intenta cambiar los términos de búsqueda o limpia los filtros.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="persons-grid">
                  {displayedPersons.map((person) => {
                    const status = statusConfig[person.estado] || statusConfig.activa;
                    const firstPhoto = person.foto ? person.foto.split(',')[0] : '';
                    const isMyPost = person.usuario_id === user?.id;

                    return (
                      <Link key={person.id} to={`/persona/${person.id}`} className={`person-card ${isMyPost ? 'my-post-highlight' : ''}`}>
                        {firstPhoto && (
                          <div className="card-image-wrapper">
                            <img src={firstPhoto} alt={`${person.nombre} ${person.apellido}`} />
                          </div>
                        )}
                        <div className="person-info">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                            <div className="card-status-badge" style={{ color: status.color, background: status.bg, margin: 0 }}>
                              {status.label}
                            </div>
                            {isMyPost && <span className="my-post-tag">Creado por ti</span>}
                          </div>
                          <h3>{person.nombre} {person.apellido}</h3>
                          {person.edad && <p className="edad">Edad: {person.edad} años</p>}
                          <p className="fecha">Desaparecido: {new Date(person.fecha_desaparicion).toLocaleDateString('es-ES')}</p>
                          <p className="ubicacion" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            <MapPin size={14} style={{ color: '#2b7d9e' }} /> {person.ubicacion}
                          </p>
                          <p className="descripcion">{person.descripcion}</p>
                          <small className="publicado-por">
                            {isMyPost ? 'Publicado por ti' : `Publicado por: ${person.publicado_por}`}
                          </small>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            <aside className="dashboard-sidebar">
              {/* Quick Publish Card */}
              <div className="sidebar-card publish-card">
                <h3>¿Necesitas difundir?</h3>
                <p>Sube los datos, teléfono de contacto y hasta 4 fotos para activar la búsqueda comunitaria.</p>
                <Link to="/create" className="btn-sidebar-primary">
                  <PlusCircle size={16} /> Publicar Nuevo Caso
                </Link>
              </div>

              {/* Emergency Hotlines Card */}
              <div className="sidebar-card emergency-card">
                <h3><ShieldAlert size={18} className="icon-emergency" /> Líneas de Emergencia</h3>
                <ul className="emergency-list">
                  <li>
                    <span className="emergency-num">911</span>
                    <span className="emergency-desc">Emergencias Nacionales</span>
                  </li>
                  <li>
                    <span className="emergency-num">800 008 5400</span>
                    <span className="emergency-desc">Alerta AMBER México</span>
                  </li>
                  <li>
                    <span className="emergency-num">800 028 7783</span>
                    <span className="emergency-desc">Comisión Nacional de Búsqueda</span>
                  </li>
                </ul>
              </div>

              {/* Security Tips */}
              <div className="sidebar-card safety-card">
                <h3><AlertTriangle size={18} className="icon-safety" /> Consejos de Seguridad</h3>
                <ul>
                  <li>Nunca publiques información sensible que pueda facilitar extorsiones.</li>
                  <li>Si recibes una pista, comunícalo a las autoridades locales de inmediato.</li>
                  <li>Mantén los datos del teléfono de contacto actualizados en tu publicación.</li>
                </ul>
              </div>
            </aside>
          </div>
        </>
      ) : (
        /* ================= PUBLIC GUEST LANDING VIEW ================= */
        <>
          {/* Ambient Background Blobs for Landing */}
          <div className="landing-background-ambient">
            <div className="landing-blob landing-blob-1"></div>
            <div className="landing-blob landing-blob-2"></div>
            <div className="landing-blob landing-blob-3"></div>
          </div>

          {/* 1. Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <span className="hero-badge">Cada Segundo Cuenta</span>
              <h1>Encontrémonos Juntos</h1>
              <p className="hero-text">
                Found Me conecta la solidaridad de la comunidad con familias en busca de personas desaparecidas. Comparte, informa y ayuda a dar esperanza.
              </p>
              <div className="hero-differentiator">
                <span className="diff-tag">Nuestra Diferencia</span>
                <p>
                  A diferencia de las redes sociales comunes donde las publicaciones se pierden rápidamente en el feed general, <strong>Found Me es un espacio dedicado exclusivamente</strong> a la búsqueda y localización de personas. Aquí cada herramienta está diseñada para dar visibilidad, organizar comentarios y coordinar esfuerzos de manera efectiva y segura.
                </p>
              </div>
              <div className="hero-stats-note">
                <div className="stats-badge-icon">
                  <span className="percent">40%</span>
                </div>
                <div className="stats-content">
                  <h4>Falta de Comunicación Inicial</h4>
                  <p>
                    Se estima que hasta un <strong>40% de las primeras horas críticas</strong> en reportes de extravío se pierden debido a la falta de comunicación rápida y coordinada. En <strong>Found Me</strong> eliminamos este obstáculo: nuestra plataforma conecta al instante a familiares con la comunidad, asegurando alertas inmediatas. Gracias a nuestra red integrada, reducimos este vacío a cero.
                  </p>
                </div>
              </div>
              <div className="hero-actions">
                <Link to="/create" className="btn-hero-primary">
                  <PlusCircle size={18} /> Publicar un Caso
                </Link>
                <a href="#cases" className="btn-hero-secondary">
                  Ver Casos Activos <ArrowRight size={16} />
                </a>
              </div>
            </div>
            <div className="hero-image-wrapper">
              <img 
                src="/hero_hope_illustration_minimalist.png" 
                alt="Colaboración y esperanza comunitaria" 
                className="hero-image" 
              />
            </div>
          </section>

          {/* 2. Features/How it works Section */}
          <section className="features-section">
            <div className="section-header">
              <h2>¿Cómo Funciona?</h2>
              <p>Unidos podemos multiplicar las posibilidades de reencuentro.</p>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon-wrapper blue">
                  <AlertCircle size={24} />
                </div>
                <h3>1. Reporta</h3>
                <p>Sube datos cruciales, señas particulares, teléfono y hasta 4 fotografías del caso para iniciar la difusión.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper teal">
                  <Share2 size={24} />
                </div>
                <h3>2. Comparte</h3>
                <p>La comunidad difunde la información en redes sociales para expandir el alcance de la búsqueda.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper mint">
                  <MessageSquare size={24} />
                </div>
                <h3>3. Aporta Pistas</h3>
                <p>Si tienes información útil, añade comentarios o respuestas anidadas para dar avisos inmediatos.</p>
              </div>
            </div>
          </section>

          {/* 3. Search and Grid Cases Section */}
          <section id="cases" className="cases-section">
            <div className="section-header">
              <h2>Publicaciones Recientes</h2>
              <p>Ayúdanos a identificar y localizar a las personas reportadas a continuación.</p>
            </div>

            <div className="search-container">
              <form onSubmit={handleSearch}>
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o descripción..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button type="submit" className="search-btn">Buscar</button>
                {search && (
                  <button type="button" className="clear-btn" onClick={() => { setSearch(''); }}>
                    Limpiar
                  </button>
                )}
              </form>
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Cargando casos recientes...</p>
              </div>
            ) : (
              <div className="persons-grid">
                {persons.length === 0 ? (
                  <div className="no-results">No se encontraron publicaciones que coincidan con tu búsqueda.</div>
                ) : (
                  persons.map((person) => {
                    const status = statusConfig[person.estado] || statusConfig.activa;
                    const firstPhoto = person.foto ? person.foto.split(',')[0] : '';
                    
                    return (
                      <Link key={person.id} to={`/persona/${person.id}`} className="person-card">
                        {firstPhoto && (
                          <div className="card-image-wrapper">
                            <img src={firstPhoto} alt={`${person.nombre} ${person.apellido}`} />
                          </div>
                        )}
                        <div className="person-info">
                          <div className="card-status-badge" style={{ color: status.color, background: status.bg }}>
                            {status.label}
                          </div>
                          <h3>{person.nombre} {person.apellido}</h3>
                          {person.edad && <p className="edad">Edad: {person.edad} años</p>}
                          <p className="fecha">Desaparecido: {new Date(person.fecha_desaparicion).toLocaleDateString('es-ES')}</p>
                          <p className="ubicacion" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            <MapPin size={14} style={{ color: '#2b7d9e' }} /> {person.ubicacion}
                          </p>
                          <p className="descripcion">{person.descripcion}</p>
                          <small className="publicado-por">Publicado por: {person.publicado_por}</small>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
