import { useEffect, useState } from 'preact/hooks';
import { useAPI } from '../Context';

type CategoriaServicio = 'Caja' | 'Ejecutivo';

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
  select:{
    padding: '8px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',

  }
};

export const LoginView = ({ setView }:any) => {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [categoria, setCategoria] = useState<CategoriaServicio | ''>('');

  const {login } = useAPI();

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    try {
      let aux: any = {
        username: loginForm.username,
        password: loginForm.password,
      };
      if (categoria) {
        aux['categoriaServicio'] = categoria;
      }
      const loginData = await login(aux);
      if (loginData.permisos) {
        localStorage.setItem('permisos', loginData.permisos);
        setView('dashboard');
      } else if (loginData.puntoAtencion) {
        localStorage.setItem('puntoAtencion', JSON.stringify(loginData.puntoAtencion));
        setView('caja');
      } else {
        throw new Error('Invalid login data');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };
  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginFormContainer}>
        <h2 style={styles.loginTitle}>Iniciar sesión</h2>
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
          <select
            value={categoria}
            onChange={(e) => setCategoria((e.target as HTMLSelectElement).value as CategoriaServicio | '')}
            style={styles.select}
          >
            <option value="">Seleccione una categoría (opcional)</option>
            <option value="Caja">Caja</option>
            <option value="Ejecutivo">Ejecutivo</option>
          </select>
          <div style={styles.formGroup}>
            <button type="submit" style={styles.loginButton}>
              Iniciar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};