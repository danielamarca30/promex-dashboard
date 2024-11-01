import { FunctionComponent } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { useAPI } from '../Context'; // Asegúrate de ajustar la ruta de importación según sea necesario
import { Save, X, Loader } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string;
  active: boolean;
}

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface EditVideoFormProps {
  video: Video;
  onSave: (updatedVideo: Video) => void;
  onCancel: () => void;
}

export function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { URL, handleUpload, apiCall } = useAPI();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await apiCall<Video[]>('/ext/videos');
      setVideos(response.map(video => ({
        ...video,
        title: video.title.toUpperCase(),
        description: video.description.toUpperCase()
      })));
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Error al cargar los videos. Por favor, intente de nuevo.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiCall(`/ext/videos/${id}`, 'DELETE');
      setVideos(videos.filter(video => video.id !== id));
      setDeletingVideo(null);
    } catch (error) {
      console.error('Error deleting video:', error);
      setError('Error al eliminar el video. Por favor, intente de nuevo.');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const video = videos.find(v => v.id === id);
      if (video) {
        await apiCall(`/ext/videos/${id}`, 'PUT', {
          ...video,
          active: !active
        });
        fetchVideos();
      }
    } catch (error) {
      console.error('Error toggling video active state:', error);
      setError('Error al cambiar el estado del video. Por favor, intente de nuevo.');
    }
  };

  const handleEdit = async (updatedVideo: Video) => {
    try {
      await apiCall(`/ext/videos/${updatedVideo.id}`, 'PUT', {
        title: updatedVideo.title.toUpperCase(),
        description: updatedVideo.description.toUpperCase(),
        active: updatedVideo.active
      });
      setEditingVideo(null);
      fetchVideos();
    } catch (error) {
      console.error('Error updating video:', error);
      setError('Error al actualizar el video. Por favor, intente de nuevo.');
    }
  };

  const handleNextVideo = () => {
    setCurrentVideoIndex(prevIndex => 
      prevIndex < videos.length - 1 ? prevIndex + 1 : 0
    );
    setIsVideoLoading(true);
  };

  const handlePreviousVideo = () => {
    setCurrentVideoIndex(prevIndex => 
      prevIndex > 0 ? prevIndex - 1 : videos.length - 1
    );
    setIsVideoLoading(true);
  };

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
  };

  const handleUploadSubmit = async (formData: FormData) => {
    setIsUploading(true);
    try {
      await handleUpload(formData);
      setShowUploadModal(true);
      fetchVideos();
    } catch (error) {
      console.error('Error uploading video:', error);
      setError('Error al subir el video. Por favor, intente de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f5f5f5',
    },
    title: {
      color: '#333',
      fontSize: '24px',
    },
    button: {
      backgroundColor: '#4CAF50',
      border: 'none',
      color: 'white',
      padding: '10px 15px',
      textAlign: 'center' as const,
      textDecoration: 'none',
      display: 'inline-block',
      fontSize: '14px',
      margin: '4px 2px',
      cursor: 'pointer',
      borderRadius: '4px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '10px',
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    input: {
      padding: '8px',
      fontSize: '14px',
      border: '1px solid #ddd',
      borderRadius: '4px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '20px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    th: {
      backgroundColor: '#f2f2f2',
      color: '#333',
      fontWeight: 'bold',
      padding: '12px',
      textAlign: 'left' as const,
      borderBottom: '2px solid #ddd',
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #ddd',
      verticalAlign: 'top' as const,
    },
    actionButton: {
      backgroundColor: '#008CBA',
      border: 'none',
      color: 'white',
      padding: '5px 10px',
      textAlign: 'center' as const,
      textDecoration: 'none',
      display: 'inline-block',
      fontSize: '12px',
      margin: '2px',
      cursor: 'pointer',
      borderRadius: '4px',
    },
    deleteButton: {
      backgroundColor: '#f44336',
    },
    uploadButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '12px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'background-color 0.3s ease',
    },
    editFormOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    editForm: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      width: '90%',
      maxWidth: '500px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    editFormTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333',
    },
    editFormContent: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '15px',
    },
    label: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#555',
    },
    editInput: {
      padding: '10px',
      fontSize: '16px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      width: '80%',
    },
    editTextarea: {
      padding: '10px',
      fontSize: '16px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      width: '80%',
      minHeight: '100px',
      resize: 'vertical' as const,
    },
    editFormActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      marginTop: '20px',
    },
    editSaveButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '10px 15px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    editCancelButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '10px 15px',
      backgroundColor: '#f44336',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
    },
  };

  const VideoUploadForm: FunctionComponent<{ onSubmit: (data: FormData) => void }> = ({ onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = (e: Event) => {
      e.preventDefault();
      if (!file) return;

      const formData = new FormData();
      formData.append('title', title.toUpperCase());
      formData.append('description', description.toUpperCase());
      formData.append('video', file);
      formData.append('usuarioId', 'user123');

      onSubmit(formData);
      setTitle('');
      setDescription('');
      setFile(null);
    };

    return (
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={title}
          onInput={(e) => setTitle((e.target as HTMLInputElement).value.toUpperCase())}
          placeholder="Título del video"
          required
          style={styles.input}
        />
        <textarea
          value={description}
          onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value.toUpperCase())}
          placeholder="Descripción del video"
          style={styles.input}
        ></textarea>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile((e.target as HTMLInputElement).files?.[0] || null)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.uploadButton} disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader size={16} className="animate-spin mr-2" />
              Subiendo...
            </>
          ) : (
            'Subir Video'
          )}
        </button>
      </form>
    );
  };

  const EditVideoForm: FunctionComponent<EditVideoFormProps> = ({ video, onSave, onCancel }) => {
    const [title, setTitle] = useState(video.title);
    const [description, setDescription] = useState(video.description);
  
    const handleSubmit = (e: Event) => {
      e.preventDefault();
      onSave({
        ...video,
        title: title.toUpperCase(),
        description: description.toUpperCase()
      });
    };
  
    return (
      <div style={styles.editFormOverlay}>
        <div style={styles.editForm}>
          <h2 style={styles.editFormTitle}>Editar Video</h2>
          <form onSubmit={handleSubmit} style={styles.editFormContent}>
            <label htmlFor="edit-title" style={styles.label}>Título</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onInput={(e) => setTitle((e.target as HTMLInputElement).value.toUpperCase())}
              placeholder="Título del video"
              required
              style={styles.editInput}
            />
            <label htmlFor="edit-description" style={styles.label}>Descripción</label>
            <textarea
              id="edit-description"
              value={description}
              onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value.toUpperCase())}
              placeholder="Descripción del video"
              style={styles.editTextarea}
            ></textarea>
            <div style={styles.editFormActions}>
              <button type="submit" style={styles.editSaveButton}>
                <Save size={16} />
                <span>Guardar</span>
              </button>
              <button type="button" onClick={onCancel} style={styles.editCancelButton}>
                <X size={16} />
                <span>Cancelar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  const ConfirmationModal: FunctionComponent<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <p>{message}</p>
        <button onClick={onConfirm} style={{...styles.button, marginRight: '10px'}}>Confirmar</button>
        <button onClick={onCancel} style={{...styles.button, backgroundColor: '#f44336'}}>Cancelar</button>
      </div>
    
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestión de Videos</h1>

      <div style={styles.form}>
        <h2 style={styles.title}>Subir Video</h2>
        <VideoUploadForm onSubmit={handleUploadSubmit} />
      </div>

      <div style={styles.form}>
        <h2 style={styles.title}>Reproductor de Video</h2>
        {videos.length > 0 && (
          <div>
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>
              {videos[currentVideoIndex].title}
            </h3>
            {isVideoLoading && (
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 1
              }}>
                <Loader size={48} className="animate-spin" />
              </div>
            )}
            <video 
              ref={videoRef}
              src={`${URL}/ext/stream/${videos[currentVideoIndex].id}`} 
              controls 
              style={{ 
                width: '100%', 
                maxWidth: '600px', 
                margin: '0 auto', 
                display: 'block',
                opacity: isVideoLoading ? 0.5 : 1
              }}
              onLoadedData={handleVideoLoad}
            ></video>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <button onClick={handlePreviousVideo} style={styles.button}>Anterior</button>
              <button onClick={handleNextVideo} style={styles.button}>Siguiente</button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 style={styles.title}>Lista de Videos</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Título</th>
              <th style={styles.th}>Descripción</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {videos.map(video => (
              <tr key={video.id}>
                <td style={styles.td}>{video.title}</td>
                <td style={styles.td}>{video.description}</td>
                <td style={styles.td}>{video.active ? 'Activo' : 'Inactivo'}</td>
                <td style={styles.td}>
                  <button 
                    onClick={() => setEditingVideo(video)}
                    style={styles.actionButton}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleToggleActive(video.id, video.active)}
                    style={styles.actionButton}
                  >
                    {video.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button 
                    onClick={() => setDeletingVideo(video.id)}
                    style={{...styles.actionButton, ...styles.deleteButton}}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deletingVideo && (
        <ConfirmationModal
          message="¿Está seguro de que desea eliminar este video?"
          onConfirm={() => handleDelete(deletingVideo)}
          onCancel={() => setDeletingVideo(null)}
        />
      )}

      {editingVideo && (
        <EditVideoForm
          video={editingVideo}
          onSave={handleEdit}
          onCancel={() => setEditingVideo(null)}
        />
      )}

      {showUploadModal && (
        <ConfirmationModal
          message="Video subido exitosamente!"
          onConfirm={() => setShowUploadModal(false)}
          onCancel={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}