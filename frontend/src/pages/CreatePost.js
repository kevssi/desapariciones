import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { missingPersonsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import { Camera, Loader2 } from 'lucide-react';
import './CreatePost.css';

export const CreatePostPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    descripcion: '',
    foto: '',
    fecha_desaparicion: '',
    ubicacion: '',
    sexo: '',
    senas_particulares: '',
    telefono: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    const crumbs = [];
    if (location.state?.from === 'profile') {
      crumbs.push({ label: 'Mi Perfil', path: '/perfil' });
    }
    crumbs.push({ label: 'Nueva Publicación', path: '/create' });
    setBreadcrumb(crumbs);
  }, [setBreadcrumb, location.state]);

  if (!isAuthenticated) {
    return (
      <div className="not-authenticated">
        <p>Debes iniciar sesión para crear una publicación</p>
        <a href="/login">Ir a Login</a>
      </div>
    );
  }

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'telefono') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'nombre' || name === 'apellido') {
      value = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s-]/g, '').slice(0, 15);
    } else if (name === 'edad') {
      value = value.replace(/\D/g, '').slice(0, 3);
      if (value && parseInt(value) > 120) {
        value = '120';
      }
    }
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido.');
        return false;
      }
      return true;
    });

    if (imageFiles.length + validFiles.length > 4) {
      setError('Puedes subir un máximo de 4 fotos.');
      return;
    }

    setImageFiles(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
    setError('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);
    setLoading(true);

    try {
      let fotoUrl = '';

      if (imageFiles.length > 0) {
        setUploadingImage(true);
        const uploadedUrls = await Promise.all(
          imageFiles.map(file => uploadImageToCloudinary(file))
        );
        fotoUrl = uploadedUrls.join(',');
        setUploadingImage(false);
      }

      await missingPersonsService.create({ ...formData, foto: fotoUrl });
      if (location.state?.from === 'profile') {
        navigate('/perfil');
      } else {
        navigate('/');
      }
    } catch (err) {
      setUploadingImage(false);
      setError(err.response?.data?.message || err.message || 'Error al crear la publicación');
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="form-container">
        <h1>Publicar Persona Desaparecida</h1>
        {error && (
          <div className="error-message">
            <strong>{error}</strong>
            {validationErrors.length > 0 && (
              <ul style={{ margin: '8px 0 0 20px', padding: 0, textAlign: 'left' }}>
                {validationErrors.map((errText, idx) => (
                  <li key={idx}>{errText}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
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
          </div>

          <div className="form-row">
            <input
              type="number"
              name="edad"
              placeholder="Edad"
              value={formData.edad}
              onChange={handleChange}
            />
            <select
              name="sexo"
              value={formData.sexo}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione Sexo</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="textarea-container">
            <textarea
              name="senas_particulares"
              placeholder="Señas particulares (tatuajes, cicatrices, lunares, vestimenta, etc.)"
              value={formData.senas_particulares}
              onChange={handleChange}
              rows="3"
              maxLength="500"
            />
            <small className="char-limit">{(formData.senas_particulares || '').length}/500</small>
          </div>

          <div className="textarea-container">
            <textarea
              name="descripcion"
              placeholder="Descripción de los hechos y señas generales"
              value={formData.descripcion}
              onChange={handleChange}
              rows="5"
              maxLength="500"
              required
            />
            <small className="char-limit">{(formData.descripcion || '').length}/500</small>
          </div>

          {/* Selector de foto con preview múltiple */}
          <div className="photo-upload-section">
            <label className="photo-upload-label">Fotos de la persona (máx. 4)</label>

            <div className="previews-grid">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="image-preview-container">
                  <img src={preview} alt={`Vista previa ${idx + 1}`} className="image-preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => handleRemoveImage(idx)}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {imageFiles.length < 4 && (
                <div
                  className="dropzone-mini"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <Camera className="dropzone-icon-lucide" size={24} style={{ color: '#2b7d9e' }} />
                  <p>Añadir foto ({imageFiles.length}/4)</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>

          <input
            type="date"
            name="fecha_desaparicion"
            value={formData.fecha_desaparicion}
            onChange={handleChange}
            required
          />

          <div className="form-row">
            <input
              type="text"
              name="ubicacion"
              placeholder="Última ubicación conocida"
              value={formData.ubicacion}
              onChange={handleChange}
              maxLength="255"
              required
            />
            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono de contacto (opcional)"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={loading || uploadingImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {uploadingImage ? (
              <>
                <Loader2 className="spinner-lucide" size={18} style={{ animation: 'spin 1s linear infinite' }} /> Subiendo foto...
              </>
            ) : loading ? (
              'Publicando...'
            ) : (
              'Publicar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
