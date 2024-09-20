import { useState, useEffect } from 'preact/hooks';
import { useAPI } from '../Context'; // Adjust the import path as needed

// Types
type PuntoAtencion = {
  id: string;
  nombre: string;
  categoriaId: string;
  empleadoId: string | null;
  activo: boolean;
};

type Categoria = {
  id: string;
  nombre: string;
};

type Empleado = {
  id: string;
  nombres: string;
  apellidos: string;
};

// Styles (reusing the styles from the previous components)
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
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
  select: {
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

// Components
const PuntoAtencionForm = ({ onSubmit, categories, empleados, initialData }: { 
  onSubmit: (data: Omit<PuntoAtencion, 'id'>) => void, 
  categories: Categoria[], 
  empleados: Empleado[],
  initialData?: PuntoAtencion 
}) => {
  const [formData, setFormData] = useState<Omit<PuntoAtencion, 'id'>>(initialData || { 
    nombre: '', 
    categoriaId: '', 
    empleadoId: null, 
    activo: true 
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ nombre: '', categoriaId: '', empleadoId: null, activo: true });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: (e.target as HTMLInputElement).value })}
        placeholder="Nombre del punto de atención"
        required
        style={styles.input}
      />
      <select
        value={formData.categoriaId}
        onChange={(e) => setFormData({ ...formData, categoriaId: (e.target as HTMLSelectElement).value })}
        required
        style={styles.select}
      >
        <option value="">Seleccione una categoría</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.nombre}</option>
        ))}
      </select>
      <select
        value={formData.empleadoId || ''}
        onChange={(e) => setFormData({ ...formData, empleadoId: (e.target as HTMLSelectElement).value || null })}
        style={styles.select}
      >
        <option value="">Seleccione un empleado (opcional)</option>
        {empleados.map((empleado) => (
          <option key={empleado.id} value={empleado.id}>{`${empleado.nombres} ${empleado.apellidos}`}</option>
        ))}
      </select>
      <label style={styles.input}>
        <input
          type="checkbox"
          checked={formData.activo}
          onChange={(e) => setFormData({ ...formData, activo: (e.target as HTMLInputElement).checked })}
        />
        Activo
      </label>
      <button type="submit" style={styles.button}>{initialData ? 'Actualizar' : 'Añadir'} Punto de Atención</button>
    </form>
  );
};

// Main App Component
export function PuntosAtencion() {
  const { apiCall, isAuthenticated, login } = useAPI();
  const [puntosAtencion, setPuntosAtencion] = useState<PuntoAtencion[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [editingPuntoAtencion, setEditingPuntoAtencion] = useState<PuntoAtencion | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPuntosAtencion();
      fetchCategories();
      fetchEmpleados();
    }
  }, [isAuthenticated]);

  const fetchPuntosAtencion = async () => {
    try {
      const data = await apiCall<PuntoAtencion[]>('/api/puntos-atencion');
      setPuntosAtencion(data);
    } catch (error) {
      console.error('Error fetching puntos de atención:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiCall<Categoria[]>('/api/categorias');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchEmpleados = async () => {
    try {
      const data = await apiCall<Empleado[]>('/api/empleados');
      setEmpleados(data);
    } catch (error) {
      console.error('Error fetching empleados:', error);
    }
  };

  const handleAddPuntoAtencion = async (puntoAtencion: Omit<PuntoAtencion, 'id'>) => {
    try {
      await apiCall<PuntoAtencion>('/api/puntos-atencion', 'POST', puntoAtencion);
      fetchPuntosAtencion();
    } catch (error) {
      console.error('Error adding punto de atención:', error);
    }
  };

  const handleUpdatePuntoAtencion = async (puntoAtencion: PuntoAtencion) => {
    try {
      await apiCall<PuntoAtencion>(`/api/puntos-atencion/${puntoAtencion.id}`, 'PUT', puntoAtencion);
      fetchPuntosAtencion();
      setEditingPuntoAtencion(null);
    } catch (error) {
      console.error('Error updating punto de atención:', error);
    }
  };

  const handleDeletePuntoAtencion = async (id: string) => {
    try {
      await apiCall(`/api/puntos-atencion/${id}`, 'DELETE');
      fetchPuntosAtencion();
    } catch (error) {
      console.error('Error deleting punto de atención:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await login({ username: 'testuser', password: 'testpassword' });
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Por favor, inicie sesión para gestionar puntos de atención</h1>
        <button onClick={handleLogin} style={styles.button}>Iniciar Sesión</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Puntos de Atención</h2>
      <PuntoAtencionForm onSubmit={handleAddPuntoAtencion} categories={categories} empleados={empleados} />
      {editingPuntoAtencion && (
        <div>
          <h3 style={styles.title}>Editar Punto de Atención</h3>
          <PuntoAtencionForm 
            onSubmit={(data) => handleUpdatePuntoAtencion({ ...data, id: editingPuntoAtencion.id })} 
            categories={categories} 
            empleados={empleados}
            initialData={editingPuntoAtencion} 
          />
          <button onClick={() => setEditingPuntoAtencion(null)} style={styles.button}>Cancelar Edición</button>
        </div>
      )}

      <h2 style={styles.title}>Lista de Puntos de Atención</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Categoría</th>
            <th style={styles.th}>Empleado</th>
            <th style={styles.th}>Activo</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {puntosAtencion.map((punto) => (
            <tr key={punto.id}>
              <td style={styles.td}>{punto.nombre}</td>
              <td style={styles.td}>{categories.find(c => c.id === punto.categoriaId)?.nombre}</td>
              <td style={styles.td}>
                {punto.empleadoId 
                  ? empleados.find(e => e.id === punto.empleadoId)?.nombres + ' ' + empleados.find(e => e.id === punto.empleadoId)?.apellidos
                  : 'No asignado'}
              </td>
              <td style={styles.td}>{punto.activo ? 'Sí' : 'No'}</td>
              <td style={styles.td}>
                <button onClick={() => setEditingPuntoAtencion(punto)} style={styles.actionButton}>Editar</button>
                <button onClick={() => handleDeletePuntoAtencion(punto.id)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}