import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { missingPersonsService, commentsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import { 
  Cake, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Pencil, 
  Trash2, 
  Search, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  CornerDownRight,
  Bookmark 
} from 'lucide-react';
import './PersonDetail.css';

const formatCommentContent = (text) => {
  if (!text) return '';
  const mentionRegex = /(@[A-Za-z0-9_áéíóúÁÉÍÓÚñÑüÜ]+)/g;
  const parts = text.split(mentionRegex);
  return parts.map((part, index) => {
    if (part.match(mentionRegex)) {
      return (
        <span key={index} className="comment-mention">
          {part}
        </span>
      );
    }
    return part;
  });
};

export const PersonDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { setBreadcrumb } = useBreadcrumb();

  const [person, setPerson] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingPerson, setLoadingPerson] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const fetchPerson = useCallback(async () => {
    try {
      setLoadingPerson(true);
      const res = await missingPersonsService.getById(id);
      setPerson(res.data);
    } catch {
      setError('No se pudo cargar la publicación.');
    } finally {
      setLoadingPerson(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      setLoadingComments(true);
      const res = await commentsService.getByPersona(id);
      setComments(res.data);
    } catch {
      // silently fail
    } finally {
      setLoadingComments(false);
    }
  }, [id]);

  const checkSavedStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await missingPersonsService.isSaved(id);
      setIsSaved(res.data.saved);
    } catch {
      // silently fail
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    fetchPerson();
    fetchComments();
    checkSavedStatus();
  }, [fetchPerson, fetchComments, checkSavedStatus]);

  useEffect(() => {
    if (person) {
      const crumbs = [];
      if (location.state?.from === 'profile') {
        crumbs.push({ label: 'Mi Perfil', path: '/perfil' });
      }
      crumbs.push({ label: `${person.nombre} ${person.apellido}`, path: `/persona/${id}`, state: location.state });
      setBreadcrumb(crumbs);
    }
  }, [person, id, setBreadcrumb, location.state]);

  const isOwner = user && person && user.id === person.usuario_id;

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await missingPersonsService.update(id, { estado: newStatus });
      setPerson(prev => ({ ...prev, estado: newStatus }));
    } catch {
      setError('Error al actualizar el estado.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const handleToggleSave = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingSave(true);
      if (isSaved) {
        await missingPersonsService.unsave(id);
        setIsSaved(false);
      } else {
        await missingPersonsService.save(id);
        setIsSaved(true);
      }
    } catch {
      setError('Error al guardar/quitar la publicación.');
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que quieres eliminar esta publicación?')) return;
    try {
      await missingPersonsService.delete(id);
      if (location.state?.from === 'profile') {
        navigate('/perfil');
      } else {
        navigate('/');
      }
    } catch {
      setError('Error al eliminar la publicación.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setSubmittingComment(true);
      const res = await commentsService.create(id, newComment.trim());
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch {
      setError('Error al publicar el comentario.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      setSubmittingComment(true);
      const res = await commentsService.create(id, replyContent.trim(), parentId);
      setComments(prev => [...prev, res.data]);
      setReplyContent('');
      setReplyingToId(null);
    } catch {
      setError('Error al publicar la respuesta.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = async (e, commentId) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    try {
      await commentsService.update(commentId, editContent.trim());
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, contenido: editContent.trim() } : c));
      setEditingCommentId(null);
      setEditContent('');
    } catch {
      setError('Error al actualizar el comentario.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Seguro que quieres eliminar este comentario?')) return;
    try {
      await commentsService.delete(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch {
      setError('Error al eliminar el comentario.');
    }
  };

  const statusConfig = {
    activa: { label: 'Desaparecido/a', color: '#e74c3c', bg: '#fdecea' },
    encontrada: { label: 'Encontrado/a ✓', color: '#27ae60', bg: '#eafaf1' },
    cerrada: { label: 'Caso Cerrado', color: '#7f8c8d', bg: '#f2f3f4' }
  };

  if (loadingPerson) {
    return <div className="detail-loading"><div className="spinner"></div><p>Cargando...</p></div>;
  }

  if (error && !person) {
    return <div className="detail-error">{error}<br /><Link to="/">Volver al inicio</Link></div>;
  }

  if (!person) return null;

  const status = statusConfig[person.estado] || statusConfig.activa;

  return (
    <div className="person-detail-page">
      <div className="detail-container">

        {/* Botón volver */}
        <Link to="/" className="back-link">← Volver</Link>

        {error && <div className="detail-error-banner">{error}</div>}

        {/* Cabecera */}
        <div className="detail-header">
          {person.foto && (
            <div className="detail-photo-wrapper">
              <div className="carousel-container">
                {(() => {
                  const photos = person.foto.split(',').filter(Boolean);
                  if (photos.length === 0) return null;
                  return (
                    <>
                      <img
                        src={photos[activePhotoIndex]}
                        alt={`${person.nombre} ${person.apellido} - Foto ${activePhotoIndex + 1}`}
                        className="detail-photo"
                      />
                      {photos.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="carousel-btn prev"
                            onClick={() =>
                              setActivePhotoIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1))
                            }
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <button
                            type="button"
                            className="carousel-btn next"
                            onClick={() =>
                              setActivePhotoIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1))
                            }
                          >
                            <ChevronRight size={24} />
                          </button>
                          <div className="carousel-indicators">
                            {photos.map((_, idx) => (
                              <span
                                key={idx}
                                className={`carousel-dot ${idx === activePhotoIndex ? 'active' : ''}`}
                                onClick={() => setActivePhotoIndex(idx)}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="detail-info">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              <div className="detail-status-badge" style={{ color: status.color, background: status.bg, margin: 0 }}>
                {status.label}
              </div>
              {isAuthenticated && (
                <button
                  type="button"
                  className={`btn-save-post ${isSaved ? 'saved' : ''}`}
                  onClick={handleToggleSave}
                  disabled={loadingSave}
                >
                  <Bookmark size={16} fill={isSaved ? '#2b7d9e' : 'none'} />
                  {isSaved ? 'Publicación Guardada' : 'Guardar Publicación'}
                </button>
              )}
            </div>
            <h1>{person.nombre} {person.apellido}</h1>
            <div className="detail-meta">
              {person.edad && (
                <span>
                  <Cake size={14} style={{ color: '#2b7d9e' }} /> {person.edad} años
                </span>
              )}
              {person.sexo && (
                <span>
                  <User size={14} style={{ color: '#2b7d9e' }} /> Sexo: <strong>{person.sexo}</strong>
                </span>
              )}
              <span>
                <Calendar size={14} style={{ color: '#2b7d9e' }} /> Desaparecido/a el {new Date(person.fecha_desaparicion).toLocaleDateString('es-ES')}
              </span>
              <span>
                <MapPin size={14} style={{ color: '#2b7d9e' }} /> {person.ubicacion}
              </span>
              {person.telefono && (
                <span>
                  <Phone size={14} style={{ color: '#2b7d9e' }} /> Contacto: <strong>{person.telefono}</strong>
                </span>
              )}
              <span>
                <User size={14} style={{ color: '#2b7d9e' }} /> Publicado por <strong>{person.publicado_por}</strong>
              </span>
            </div>
            
            {person.senas_particulares && (
              <div className="detail-senas">
                <strong>Señas Particulares:</strong>
                <p>{person.senas_particulares}</p>
              </div>
            )}
            
            <p className="detail-descripcion">{person.descripcion}</p>

            {/* Acciones del dueño */}
            {isOwner && (
              <div className="owner-actions">
                <Link to={`/editar/${person.id}`} state={location.state} className="btn-edit">
                  <Pencil size={14} style={{ marginRight: '6px' }} /> Editar publicación
                </Link>
                <button className="btn-delete" onClick={handleDelete}>
                  <Trash2 size={14} style={{ marginRight: '6px' }} /> Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cambiar estado — solo el dueño */}
        {isOwner && (
          <div className="status-section">
            <h3>Estado de la búsqueda</h3>
            <div className="status-buttons">
              <button
                className={`status-btn activa ${person.estado === 'activa' ? 'active' : ''}`}
                onClick={() => handleStatusChange('activa')}
                disabled={updatingStatus || person.estado === 'activa'}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Search size={14} /> En búsqueda
              </button>
              <button
                className={`status-btn encontrada ${person.estado === 'encontrada' ? 'active' : ''}`}
                onClick={() => handleStatusChange('encontrada')}
                disabled={updatingStatus || person.estado === 'encontrada'}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle size={14} /> Fue encontrado/a
              </button>
              <button
                className={`status-btn cerrada ${person.estado === 'cerrada' ? 'active' : ''}`}
                onClick={() => handleStatusChange('cerrada')}
                disabled={updatingStatus || person.estado === 'cerrada'}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <XCircle size={14} /> Cerrar caso
              </button>
            </div>
          </div>
        )}

        {/* Sección de comentarios */}
        <div className="comments-section">
          <h3>Comentarios ({comments.length})</h3>

          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                placeholder="Escribe un comentario, pista o información relevante..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <div className="comment-form-footer">
                <span className="char-count">{newComment.length}/500</span>
                <button type="submit" disabled={submittingComment || !newComment.trim()}>
                  {submittingComment ? 'Publicando...' : 'Comentar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="login-to-comment">
              <Link to="/login">Inicia sesión</Link> para dejar un comentario.
            </div>
          )}

          <div className="comments-list">
            {loadingComments ? (
              <div className="comments-loading">Cargando comentarios...</div>
            ) : comments.length === 0 ? (
              <div className="no-comments">Sé el primero en comentar.</div>
            ) : (
              (() => {
                const topLevelComments = comments.filter(c => !c.parent_id);
                const getRepliesFor = (parentId) => comments.filter(c => c.parent_id === parentId);

                const renderCommentNode = (comment, isReply = false) => {
                  const hasEditAccess = user && user.id === comment.usuario_id;
                  
                  return (
                    <div key={comment.id} className={`comment-item ${isReply ? 'comment-reply-item' : ''}`}>
                      <div className="comment-avatar">
                        {comment.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="comment-body">
                        <div className="comment-header">
                          <strong>{comment.nombre} {comment.apellido}</strong>
                          {isReply && <span className="reply-indicator">Respondió</span>}
                          <span className="comment-date">
                            {new Date(comment.fecha_creacion).toLocaleDateString('es-ES', {
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {editingCommentId === comment.id ? (
                          <form
                            onSubmit={(e) => handleEditComment(e, comment.id)}
                            className="edit-comment-form"
                          >
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={2}
                              maxLength={500}
                              required
                            />
                            <div className="edit-form-footer">
                              <button
                                type="button"
                                className="btn-cancel-edit"
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditContent('');
                                }}
                              >
                                Cancelar
                              </button>
                              <button type="submit" disabled={!editContent.trim()} className="btn-save-edit">
                                Guardar
                              </button>
                            </div>
                          </form>
                        ) : (
                          <p className="comment-content">{formatCommentContent(comment.contenido)}</p>
                        )}

                        <div className="comment-actions">
                          {isAuthenticated && (
                            <button
                              type="button"
                              className="comment-action-btn reply-btn"
                              onClick={() => {
                                setReplyingToId(replyingToId === comment.id ? null : comment.id);
                                setReplyContent(`@${comment.nombre} `);
                              }}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <CornerDownRight size={14} /> Responder
                            </button>
                          )}
                          
                          {hasEditAccess && (
                            <>
                              <button
                                type="button"
                                className="comment-action-btn edit-btn"
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditContent(comment.contenido);
                                }}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Pencil size={12} /> Editar
                              </button>
                              <button
                                type="button"
                                className="comment-action-btn delete-btn"
                                onClick={() => handleDeleteComment(comment.id)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Trash2 size={12} /> Eliminar
                              </button>
                            </>
                          )}
                        </div>

                        {/* Formulario de respuesta */}
                        {replyingToId === comment.id && (
                          <form
                            onSubmit={(e) => handleAddReply(e, comment.parent_id || comment.id)}
                            className="reply-comment-form"
                          >
                            <textarea
                              placeholder="Escribe una respuesta pública..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              rows={2}
                              maxLength={500}
                              required
                            />
                            <div className="reply-form-footer">
                              <button
                                type="button"
                                className="btn-cancel-reply"
                                onClick={() => {
                                  setReplyingToId(null);
                                  setReplyContent('');
                                }}
                              >
                                Cancelar
                              </button>
                              <button type="submit" disabled={!replyContent.trim()} className="btn-submit-reply">
                                Responder
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                };

                return topLevelComments.map(parentComment => {
                  const replies = getRepliesFor(parentComment.id);
                  return (
                    <div key={parentComment.id} className="comment-thread-container">
                      {renderCommentNode(parentComment, false)}
                      {replies.length > 0 && (
                        <div className="replies-list">
                          {replies.map(reply => renderCommentNode(reply, true))}
                        </div>
                      )}
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
