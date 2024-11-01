import { useState, useEffect } from 'preact/hooks';
import { useAPI } from '../Context';

interface PuntoAtencion {
  id: string;
  nombre: string;
  categoriaId: string;
  empleadoId: string | null;
}

const styles = {
  loginContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  loginFormContainer: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  loginTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#333',
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  formLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
    color: '#4a5568',
  },
  formInput: {
    padding: '0.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '1rem',
    transition: 'border-color 0.2s ease-in-out',
  },
  loginButton: {
    backgroundColor: '#4299e1',
    color: 'white',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
  },
  select: {
    padding: '8px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '100%',
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  modalButton: {
    backgroundColor: '#4299e1',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
    marginTop: '1rem',
  },
};

export const LoginView = ({ setView }: { setView: (view: string) => void }) => {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [puntosAtencion, setPuntosAtencion] = useState<PuntoAtencion[]>([]);
  const [selectedPuntoAtencion, setSelectedPuntoAtencion] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { login, apiCall, token } = useAPI();

  useEffect(() => {
    if (token) {
      checkUserPermissions();
    }
  }, [token]);

  const checkUserPermissions = async () => {
    try {
      const permisos = JSON.parse(localStorage.getItem('permisos') || '[]');
      const empleado = JSON.parse(localStorage.getItem('empleado') || '{}');
  
      if (permisos.includes('tokenBasico')) {
        const hasPuntoAtencion = permisos.includes('puntoAtencion');
        const hasAdmin = permisos.includes('admin');
  
        if (hasPuntoAtencion && hasAdmin) {
          setView('dashboard');
        } else if (hasPuntoAtencion) {
          const data = await apiCall<PuntoAtencion[]>('/api/puntos-atencion');
          console.log('puntos de atencion data', data);
          const puntosUsuario = data.filter(e => e.empleadoId === empleado.id);
          console.log('puntos de atencion del usuario', puntosUsuario);
          
          if (puntosUsuario.length === 1) {
            localStorage.setItem('puntoAtencion', JSON.stringify(puntosUsuario[0]));
            setView('caja');
          } else if (puntosUsuario.length > 1) {
            setPuntosAtencion(puntosUsuario);
            setShowModal(true);
          } else {
            setError('No se encontraron puntos de atención asignados a este usuario.');
          }
        }
      }
    } catch (error) {
      console.error('Error checking user permissions:', error);
      setError('Error al verificar permisos de usuario. Por favor, intente de nuevo.');
    }
  };

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setError(null);
    try {
      console.log('logggggiinn', loginForm);
      const loginData = await login(loginForm);
      console.log('dataaa', loginData);
      
      await checkUserPermissions();
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    }
  };

  const handlePuntoAtencionSelection = () => {
    if (selectedPuntoAtencion) {
      const puntoSeleccionado = puntosAtencion.find(p => p.id === selectedPuntoAtencion);
      if (puntoSeleccionado) {
        localStorage.setItem('puntoAtencion', JSON.stringify(puntoSeleccionado));
        setShowModal(false);
        setView('caja');
      }
    }
  };
  
  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginFormContainer}>
        <h2 style={styles.loginTitle}>Iniciar sesión</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleLogin} style={styles.loginForm}>
          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.formLabel}>
              Usuario
            </label>
            <input
              id="username"
              type="text"
              required
              style={styles.formInput}
              placeholder="Ingrese su usuario"
              value={loginForm.username}
              onInput={(e) => setLoginForm(prev => ({ ...prev, username: (e.target as HTMLInputElement).value }))}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.formLabel}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              style={styles.formInput}
              placeholder="Ingrese su contraseña"
              value={loginForm.password}
              onInput={(e) => setLoginForm(prev => ({ ...prev, password: (e.target as HTMLInputElement).value }))}
            />
          </div>
          <div style={styles.formGroup}>
            <button type="submit" style={styles.loginButton}>
              Iniciar sesión
            </button>
          </div>
        </form>
      </div>

      {showModal && (
        <div>
          <div style={styles.modalOverlay} onClick={() => setShowModal(false)} />
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Seleccionar Punto de Atención</h3>
            <p>Por favor, seleccione el punto de atención al que desea ingresar.</p>
            <select
              style={styles.select}
              value={selectedPuntoAtencion || ''}
              onChange={(e) => setSelectedPuntoAtencion((e.target as HTMLSelectElement).value)}
            >
              <option value="">Seleccione un punto de atención</option>
              {puntosAtencion.map((punto) => (
                <option key={punto.id} value={punto.id}>
                  {punto.nombre}
                </option>
              ))}
            </select>
            <button
              style={styles.modalButton}
              onClick={handlePuntoAtencionSelection}
              disabled={!selectedPuntoAtencion}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};