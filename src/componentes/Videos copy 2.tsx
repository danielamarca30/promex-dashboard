import { h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { useAPI } from '../Context';

interface Video {
  id: string;
  title: string;
  description: string;
  usuarioId: string;
  active: boolean;
}

export function Videos() {
  const { apiCall } = useAPI();
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await apiCall<Video[]>('/ext/videos');
      setVideos(response);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Error al cargar los videos. Por favor, intente de nuevo.');
    }
  };

  const handleUpload = async (formData: FormData) => {
    try {
      await apiCall('/ext/videos', 'POST', formData);
      alert('Video uploaded successfully!');
      fetchVideos();
    } catch (error) {
      console.error('Error uploading video:', error);
      setError('Error al subir el video. Por favor, intente de nuevo.');
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

  const handleNextVideo = () => {
    setCurrentVideoIndex(prevIndex => 
      prevIndex < videos.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handlePreviousVideo = () => {
    setCurrentVideoIndex(prevIndex => 
      prevIndex > 0 ? prevIndex - 1 : videos.length - 1
    );
  };

  // Styles (unchanged)
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
  };

  // VideoUploadForm component
  const VideoUploadForm = ({ onSubmit }: { onSubmit: (data: FormData) => void }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = (e: Event) => {
      e.preventDefault();
      if (!file) return;

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
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
          onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
          placeholder="Título del video"
          required
          style={styles.input}
        />
        <textarea
          value={description}
          onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
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
        <button type="submit" style={styles.button}>Subir Video</button>
      </form>
    );
  };

  // ConfirmationModal component
  const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
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
        <VideoUploadForm onSubmit={handleUpload} />
      </div>

      <div style={styles.form}>
        <h2 style={styles.title}>Reproductor de Video</h2>
        {videos.length > 0 && (
          <div>
            <video 
              src={`http://192.168.194.31/ext/stream/${videos[currentVideoIndex].id}`} 
              controls 
              style={{ width: '100%', maxWidth: '600px', margin: '0 auto', display: 'block' }}
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
    </div>
  );
}
