import { useState, useEffect } from 'preact/hooks';
import { useAPI } from '../Context'; // Adjust the import path as needed

// Types
type Servicio = {
  id: string;
  nombre: string;
  descripcion?: string;
  categoriaId: string;
  subCategoriaId?: string;
  tiempoEstimado: number;
  activo: boolean;
};

type Categoria = {
  id: string;
  nombre: string;
};

type Subcategoria = {
  id: string;
  nombre: string;
  categoriaId: string;
};

// Estilos
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
    list: {
      listStyleType: 'none',
      padding: '0',
    },
    listItem: {
      backgroundColor: 'white',
      marginBottom: '10px',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    subList: {
      listStyleType: 'none',
      paddingLeft: '20px',
    },
    subListItem: {
      backgroundColor: '#f9f9f9',
      margin: '5px 0',
      padding: '10px',
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
    categoryRow: {
      backgroundColor: '#e6f3ff',
    },
    subcategoryRow: {
      backgroundColor: '#f9f9f9',
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
    }
  };

// Components
const ServicioForm = ({ onSubmit, categories, subcategories, initialData }: { 
  onSubmit: (data: Omit<Servicio, 'id'>) => void, 
  categories: Categoria[], 
  subcategories: Subcategoria[],
  initialData?: Servicio 
}) => {
  const [formData, setFormData] = useState<Omit<Servicio, 'id'>>(initialData || { 
    nombre: '', 
    descripcion: '', 
    categoriaId: '', 
    subCategoriaId: '', 
    tiempoEstimado: 0, 
    activo: true 
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ nombre: '', descripcion: '', categoriaId: '', subCategoriaId: '', tiempoEstimado: 0, activo: true });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: (e.target as HTMLInputElement).value })}
        placeholder="Nombre del servicio"
        required
        style={styles.input}
      />
      <input
        type="text"
        value={formData.descripcion}
        onChange={(e) => setFormData({ ...formData, descripcion: (e.target as HTMLInputElement).value })}
        placeholder="Descripción (opcional)"
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
        value={formData.subCategoriaId}
        onChange={(e) => setFormData({ ...formData, subCategoriaId: (e.target as HTMLSelectElement).value })}
        style={styles.select}
      >
        <option value="">Seleccione una subcategoría (opcional)</option>
        {subcategories
          .filter(sub => sub.categoriaId === formData.categoriaId)
          .map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>{subcategory.nombre}</option>
          ))}
      </select>
      <input
        type="number"
        value={formData.tiempoEstimado}
        onChange={(e) => setFormData({ ...formData, tiempoEstimado: parseInt((e.target as HTMLInputElement).value) })}
        placeholder="Tiempo estimado (minutos)"
        required
        style={styles.input}
      />
      <label style={styles.input}>
        <input
          type="checkbox"
          checked={formData.activo}
          onChange={(e) => setFormData({ ...formData, activo: (e.target as HTMLInputElement).checked })}
        />
        Activo
      </label>
      <button type="submit" style={styles.button}>{initialData ? 'Actualizar' : 'Añadir'} Servicio</button>
    </form>
  );
};

// Main App Component
export function Servicios() {
  const { apiCall, isAuthenticated, login } = useAPI();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategoria[]>([]);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchServicios();
      fetchCategories();
      fetchSubcategories();
    }
  }, [isAuthenticated]);

  const fetchServicios = async () => {
    try {
      const data = await apiCall<Servicio[]>('/api/servicios');
      setServicios(data);
    } catch (error) {
      console.error('Error fetching servicios:', error);
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

  const fetchSubcategories = async () => {
    try {
      const data = await apiCall<Subcategoria[]>('/api/subcategorias');
      setSubcategories(data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleAddServicio = async (servicio: Omit<Servicio, 'id'>) => {
    try {
      await apiCall<Servicio>('/api/servicios', 'POST', servicio);
      fetchServicios();
    } catch (error) {
      console.error('Error adding servicio:', error);
    }
  };

  const handleUpdateServicio = async (servicio: Servicio) => {
    try {
      await apiCall<Servicio>(`/api/servicios/${servicio.id}`, 'PUT', servicio);
      fetchServicios();
      setEditingServicio(null);
    } catch (error) {
      console.error('Error updating servicio:', error);
    }
  };

  const handleDeleteServicio = async (id: string) => {
    try {
      await apiCall(`/api/servicios/${id}`, 'DELETE');
      fetchServicios();
    } catch (error) {
      console.error('Error deleting servicio:', error);
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
        <h1 style={styles.title}>Por favor, inicie sesión para gestionar servicios</h1>
        <button onClick={handleLogin} style={styles.button}>Iniciar Sesión</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Servicios</h2>
      <ServicioForm onSubmit={handleAddServicio} categories={categories} subcategories={subcategories} />
      {editingServicio && (
        <div>
          <h3 style={styles.title}>Editar Servicio</h3>
          <ServicioForm 
            onSubmit={(data) => handleUpdateServicio({ ...data, id: editingServicio.id })} 
            categories={categories} 
            subcategories={subcategories}
            initialData={editingServicio} 
          />
          <button onClick={() => setEditingServicio(null)} style={styles.button}>Cancelar Edición</button>
        </div>
      )}

      <h2 style={styles.title}>Lista de Servicios</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Descripción</th>
            <th style={styles.th}>Categoría</th>
            <th style={styles.th}>Subcategoría</th>
            <th style={styles.th}>Tiempo Estimado</th>
            <th style={styles.th}>Activo</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((servicio) => (
            <tr key={servicio.id}>
              <td style={styles.td}>{servicio.nombre}</td>
              <td style={styles.td}>{servicio.descripcion}</td>
              <td style={styles.td}>{categories.find(c => c.id === servicio.categoriaId)?.nombre}</td>
              <td style={styles.td}>{subcategories.find(s => s.id === servicio.subCategoriaId)?.nombre}</td>
              <td style={styles.td}>{servicio.tiempoEstimado} minutos</td>
              <td style={styles.td}>{servicio.activo ? 'Sí' : 'No'}</td>
              <td style={styles.td}>
                <button onClick={() => setEditingServicio(servicio)} style={styles.actionButton}>Editar</button>
                <button onClick={() => handleDeleteServicio(servicio.id)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}