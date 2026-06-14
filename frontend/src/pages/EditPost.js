import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { missingPersonsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import { Camera, Loader2 } from 'lucide-react';
import './CreatePost.css';

export const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setBreadcrumb } = useBreadcrumb();

  const [formData, setFormData] = useState(null);
  const [existingUrls, setExistingUrls] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const res = await missingPersonsService.getById(id);
        const p = res.data;

        // Solo el dueño puede editar
        if (user && user.id !== p.usuario_id) {
          navigate(`/persona/${id}`);
          return;
        }

        setFormData({
          nombre: p.nombre || '',
          apellido: p.apellido || '',
          edad: p.edad || '',
          descripcion: p.descripcion || '',
          foto: p.foto || '',
          fecha_desaparicion: p.fecha_desaparicion
            ? p.fecha_desaparicion.split('T')[0]
            : '',
          ubicacion: p.ubicacion || '',
          sexo: p.sexo || '',
          senas_particulares: p.senas_particulares || '',
          telefono: p.telefono || ''
        });

        if (p.foto) {
          const urls = p.foto.split(',').filter(Boolean);
          setExistingUrls(urls);
        }
      } catch {
        setError('No se pudo cargar la publicación.');
      } finally {
        setFetching(false);
      }
    };
    fetchPerson();
  }, [id, user, navigate]);

  useEffect(() => {
    if (formData && formData.nombre) {
      setBreadcrumb([
        { label: `${formData.nombre} ${formData.apellido}`, path: `/persona/${id}` },
        { label: 'Editar', path: `/editar/${id}` }
      ]);
    }
  }, [formData, id, setBreadcrumb]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const totalCurrentCount = existingUrls.length + newImageFiles.length;
    if (totalCurrentCount + validFiles.length > 4) {
      setError('Puedes tener un máximo de 4 fotos en total.');
      return;
    }

    setNewImageFiles(prev => [...prev, ...validFiles]);
    setNewImagePreviews(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
    setError('');
  };

  const handleRemoveImage = (indexToRemove) => {
    if (indexToRemove < existingUrls.length) {
      setExistingUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
    } else {
      const idxInNew = indexToRemove - existingUrls.length;
      setNewImageFiles(prev => prev.filter((_, idx) => idx !== idxInNew));
      setNewImagePreviews(prev => prev.filter((_, idx) => idx !== idxInNew));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let uploadedUrls = [];

      if (newImageFiles.length > 0) {
        setUploadingImage(true);
        uploadedUrls = await Promise.all(
          newImageFiles.map(file => uploadImageToCloudinary(file))
        );
        setUploadingImage(false);
      }

      const finalUrls = [...existingUrls, ...uploadedUrls].join(',');

      await missingPersonsService.update(id, { ...formData, foto: finalUrls });
      navigate(`/persona/${id}`);
    } catch (err) {
      setUploadingImage(false);
      setError(err.response?.data?.message || err.message || 'Error al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="create-post-page"><div className="form-container"><p>Cargando...</p></div></div>;
  }

  if (!formData) {
    return <div className="create-post-page"><div className="form-container"><p>{error}</p></div></div>;
  }

  return (
    <div className="create-post-page">
      <div className="form-container">
        <h1>Editar Publicación</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
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

          <textarea
            name="senas_particulares"
            placeholder="Señas particulares (tatuajes, cicatrices, lunares, vestimenta, etc.)"
            value={formData.senas_particulares}
            onChange={handleChange}
            rows="3"
          />

          <textarea
            name="descripcion"
            placeholder="Descripción de los hechos y señas generales"
            value={formData.descripcion}
            onChange={handleChange}
            rows="5"
            required
          />

          {/* Fotos */}
          <div className="photo-upload-section">
            <label className="photo-upload-label">Fotos de la persona (máx. 4)</label>

            <div className="previews-grid">
              {[...existingUrls, ...newImagePreviews].map((preview, idx) => (
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

              {(existingUrls.length + newImageFiles.length) < 4 && (
                <div
                  className="dropzone-mini"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <Camera className="dropzone-icon-lucide" size={24} style={{ color: '#2b7d9e' }} />
                  <p>Añadir foto ({(existingUrls.length + newImageFiles.length)}/4)</p>
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

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={() => navigate(`/persona/${id}`)}
              style={{ background: '#f0f0f0', color: '#333', flex: 1 }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading || uploadingImage} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {uploadingImage ? (
                <>
                  <Loader2 className="spinner-lucide" size={18} style={{ animation: 'spin 1s linear infinite' }} /> Subiendo...
                </>
              ) : loading ? (
                'Guardando...'
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
