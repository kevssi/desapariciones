import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Calendar, 
  Camera, 
  Edit2, 
  Save, 
  X, 
  FolderHeart, 
  Bookmark, 
  MapPin, 
  Loader2 
} from 'lucide-react';
import { authService, missingPersonsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import './Profile.css';

export const ProfilePage = () => {
  const { user, login } = useAuth();
  const { setBreadcrumb } = useBreadcrumb();
  
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('my-posts');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', apellido: '', bio: '' });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProfileAndPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Obtener perfil del usuario
      const profileRes = await authService.getProfile();
      const profData = profileRes.data;
      setProfile(profData);
      setFormData({
        nombre: profData.nombre || '',
        apellido: profData.apellido || '',
        bio: profData.bio || ''
      });

      // 2. Obtener todas las publicaciones para filtrar las propias
      const allPostsRes = await missingPersonsService.getAll(1, 100);
      const filteredMyPosts = allPostsRes.data.filter(p => p.usuario_id === profData.id);
      setMyPosts(filteredMyPosts);

      // 3. Obtener publicaciones guardadas
      const savedRes = await missingPersonsService.getSaved();
      setSavedPosts(savedRes.data);

    } catch (err) {
      console.error(err);
      setError('Error al cargar la información del perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setBreadcrumb([{ label: 'Mi Perfil', path: '/perfil' }]);
    fetchProfileAndPosts();
  }, [fetchProfileAndPosts, setBreadcrumb]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploadingPhoto(true);
      setError('');
      setSuccessMsg('');
      
      // Subir a Cloudinary
      const photoUrl = await uploadImageToCloudinary(file);
      
      // Actualizar perfil en el backend
      await authService.updateProfile({
        nombre: formData.nombre,
        apellido: formData.apellido,
        bio: formData.bio,
        foto_perfil: photoUrl
      });
      
      // Sincronizar contexto y estado local
      setProfile(prev => ({ ...prev, foto_perfil: photoUrl }));
      
      // Actualizar datos de sesión del AuthContext
      const token = localStorage.getItem('token');
      login({ ...user, foto_perfil: photoUrl }, token);
      
      setSuccessMsg('Foto de perfil actualizada con éxito.');
    } catch (err) {
      setError(err.message || 'Error al subir la foto de perfil.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setError('El nombre y apellido son obligatorios.');
      return;
    }

    try {
      setSubmittingForm(true);
      setError('');
      setSuccessMsg('');

      await authService.updateProfile({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        bio: formData.bio.trim(),
        foto_perfil: profile.foto_perfil
      });

      setProfile(prev => ({
        ...prev,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        bio: formData.bio.trim()
      }));

      // Sincronizar contexto
      const token = localStorage.getItem('token');
      login({ 
        ...user, 
        nombre: formData.nombre.trim(), 
        apellido: formData.apellido.trim() 
      }, token);

      setSuccessMsg('Información de perfil actualizada.');
      setIsEditing(false);
    } catch (err) {
      setError('Error al actualizar los datos de perfil.');
    } finally {
      setSubmittingForm(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading-container">
        <Loader2 className="spinner-loading" size={40} />
        <p>Cargando perfil de usuario...</p>
      </div>
    );
  }

  const postsToDisplay = activeTab === 'my-posts' ? myPosts : savedPosts;

  return (
    <div className="profile-page">
      {/* Ambient background blobs */}
      <div className="profile-background-ambient">
        <div className="profile-blob profile-blob-1"></div>
        <div className="profile-blob profile-blob-2"></div>
      </div>

      <div className="profile-layout">
        {/* Left Column: User Card & Edit */}
        <aside className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar-wrapper">
              {profile.foto_perfil ? (
                <img 
                  src={profile.foto_perfil} 
                  alt={`${profile.nombre} ${profile.apellido}`} 
                  className="profile-avatar-img"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profile.nombre.charAt(0).toUpperCase()}
                </div>
              )}
              
              <label className="avatar-upload-overlay" htmlFor="avatar-file-input">
                {uploadingPhoto ? (
                  <Loader2 className="spinner-avatar" size={20} />
                ) : (
                  <>
                    <Camera size={18} />
                    <span>Cambiar</span>
                  </>
                )}
                <input 
                  type="file" 
                  id="avatar-file-input" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className="profile-info-display">
              <h2>{profile.nombre} {profile.apellido}</h2>
              <p className="profile-email">
                <Mail size={14} /> {profile.email}
              </p>
              <p className="profile-date">
                <Calendar size={14} /> Miembro desde: {new Date(profile.fecha_creacion).toLocaleDateString('es-ES', {
                  month: 'long', year: 'numeric'
                })}
              </p>
              
              <div className="profile-bio-box">
                {profile.bio ? (
                  <p className="bio-text">"{profile.bio}"</p>
                ) : (
                  <p className="bio-empty">Sin descripción agregada aún.</p>
                )}
              </div>

              {!isEditing && (
                <button 
                  className="btn-edit-profile"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={14} /> Editar Perfil
                </button>
              )}
            </div>
          </div>

          {/* Formulario de Edición */}
          {isEditing && (
            <div className="edit-profile-card">
              <div className="edit-card-header">
                <h3>Editar Datos</h3>
                <button className="btn-close-edit" onClick={() => setIsEditing(false)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label>Nombre</label>
                  <input 
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input 
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Sobre ti (Biografía)</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Escribe algo sobre ti..."
                    rows={4}
                    maxLength={250}
                  />
                  <small className="char-limit">{formData.bio.length}/250</small>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-save" 
                    disabled={submittingForm}
                  >
                    {submittingForm ? <Loader2 className="spinner-btn" size={14} /> : <Save size={14} />}
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && <div className="profile-alert error">{error}</div>}
          {successMsg && <div className="profile-alert success">{successMsg}</div>}
        </aside>

        {/* Right Column: Grid and Tabs */}
        <main className="profile-content">
          <div className="profile-tabs">
            <button 
              className={`profile-tab-btn ${activeTab === 'my-posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-posts')}
            >
              <FolderHeart size={18} /> Mis Publicaciones ({myPosts.length})
            </button>
            <button 
              className={`profile-tab-btn ${activeTab === 'saved-posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved-posts')}
            >
              <Bookmark size={18} /> Publicaciones Guardadas ({savedPosts.length})
            </button>
          </div>

          {postsToDisplay.length === 0 ? (
            <div className="profile-empty-state">
              {activeTab === 'my-posts' ? (
                <>
                  <FolderHeart className="empty-icon" size={48} />
                  <h3>No tienes publicaciones aún</h3>
                  <p>Si necesitas difundir la búsqueda de un ser querido, puedes crear un nuevo reporte.</p>
                  <Link to="/create" state={{ from: 'profile' }} className="btn-empty-publish">
                    Crear Reporte
                  </Link>
                </>
              ) : (
                <>
                  <Bookmark className="empty-icon" size={48} />
                  <h3>No has guardado publicaciones</h3>
                  <p>Explora los casos de búsqueda y haz clic en "Guardar Publicación" para tenerlos a la mano.</p>
                  <Link to="/" className="btn-empty-publish">
                    Explorar Casos
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="profile-posts-grid">
              {postsToDisplay.map((person) => {
                const firstPhoto = person.foto ? person.foto.split(',')[0] : '';
                return (
                  <Link key={person.id} to={`/persona/${person.id}`} state={{ from: 'profile' }} className="profile-post-card">
                    {firstPhoto && (
                      <div className="profile-post-image">
                        <img src={firstPhoto} alt={`${person.nombre} ${person.apellido}`} />
                      </div>
                    )}
                    <div className="profile-post-info">
                      <h3>{person.nombre} {person.apellido}</h3>
                      {person.edad && <p className="edad">{person.edad} años</p>}
                      <p className="ubicacion">
                        <MapPin size={12} /> {person.ubicacion}
                      </p>
                      <span className={`badge-estado ${person.estado}`}>
                        {person.estado === 'activa' ? 'En búsqueda' : person.estado === 'encontrada' ? 'Encontrado' : 'Cerrado'}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
