import { useState, useEffect } from 'preact/hooks';
import { useAPI } from '../Context'; // Ajusta la ruta de importación según sea necesario

// Tipos
type Categoria = {
  id: string;
  nombre: string;
  descripcion?: string;
};

type Subcategoria = {
  id: string;
  nombre: string;
  descripcion?: string;
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

// Componentes
const CategoryForm = ({ onSubmit, initialData }: { onSubmit: (data: Omit<Categoria, 'id'>) => void, initialData?: Categoria }) => {
  const [formData, setFormData] = useState<Omit<Categoria, 'id'>>(initialData || { nombre: '', descripcion: '' });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ nombre: '', descripcion: '' });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: (e.target as HTMLInputElement).value })}
        placeholder="Nombre de la categoría"
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
      <button type="submit" style={styles.button}>{initialData ? 'Actualizar' : 'Añadir'} Categoría</button>
    </form>
  );
};

const SubcategoryForm = ({ onSubmit, categories, initialData }: { onSubmit: (data: Omit<Subcategoria, 'id'>) => void, categories: Categoria[], initialData?: Subcategoria }) => {
  const [formData, setFormData] = useState<Omit<Subcategoria, 'id'>>(initialData || { nombre: '', descripcion: '', categoriaId: '' });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ nombre: '', descripcion: '', categoriaId: '' });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: (e.target as HTMLInputElement).value })}
        placeholder="Nombre de la subcategoría"
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
      <button type="submit" style={styles.button}>{initialData ? 'Actualizar' : 'Añadir'} Subcategoría</button>
    </form>
  );
};

// Componente principal de la aplicación
export function Categorias() {
  const { apiCall, isAuthenticated, login } = useAPI();
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategoria[]>([]);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategoria | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchSubcategories();
    }
  }, [isAuthenticated]);

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

  const handleAddCategory = async (category: Omit<Categoria, 'id'>) => {
    try {
      await apiCall<Categoria>('/api/categorias', 'POST', category);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async (category: Categoria) => {
    try {
      await apiCall<Categoria>(`/api/categorias/${category.id}`, 'PUT', category);
      fetchCategories();
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await apiCall(`/api/categorias/${id}`, 'DELETE');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleAddSubcategory = async (subcategory: Omit<Subcategoria, 'id'>) => {
    try {
      await apiCall<Subcategoria>('/api/subcategorias', 'POST', subcategory);
      fetchSubcategories();
    } catch (error) {
      console.error('Error adding subcategory:', error);
    }
  };

  const handleUpdateSubcategory = async (subcategory: Subcategoria) => {
    try {
      await apiCall<Subcategoria>(`/api/subcategorias/${subcategory.id}`, 'PUT', subcategory);
      fetchSubcategories();
      setEditingSubcategory(null);
    } catch (error) {
      console.error('Error updating subcategory:', error);
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    try {
      await apiCall(`/api/subcategorias/${id}`, 'DELETE');
      fetchSubcategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
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
        <h1 style={styles.title}>Por favor, inicie sesión para gestionar categorías y subcategorías</h1>
        <button onClick={handleLogin} style={styles.button}>Iniciar Sesión</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Categorías</h2>
      <CategoryForm onSubmit={handleAddCategory} />
      {editingCategory && (
        <div>
          <h3 style={styles.title}>Editar Categoría</h3>
          <CategoryForm onSubmit={(data) => handleUpdateCategory({ ...data, id: editingCategory.id })} initialData={editingCategory} />
          <button onClick={() => setEditingCategory(null)} style={styles.button}>Cancelar Edición</button>
        </div>
      )}

      <h2 style={styles.title}>Subcategorías</h2>
      <SubcategoryForm onSubmit={handleAddSubcategory} categories={categories} />
      {editingSubcategory && (
        <div>
          <h3 style={styles.title}>Editar Subcategoría</h3>
          <SubcategoryForm onSubmit={(data) => handleUpdateSubcategory({ ...data, id: editingSubcategory.id })} categories={categories} initialData={editingSubcategory} />
          <button onClick={() => setEditingSubcategory(null)} style={styles.button}>Cancelar Edición</button>
        </div>
      )}

<h2 style={styles.title}>Lista de Categorías y Subcategorías</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Descripción</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <>
              <tr key={category.id} style={styles.categoryRow}>
                <td style={styles.td}><strong>{category.nombre}</strong></td>
                <td style={styles.td}>{category.descripcion}</td>
                <td style={styles.td}>
                  <button onClick={() => setEditingCategory(category)} style={styles.actionButton}>Editar</button>
                  <button onClick={() => handleDeleteCategory(category.id)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
                </td>
              </tr>
              {subcategories
                .filter((subcategory) => subcategory.categoriaId === category.id)
                .map((subcategory) => (
                  <tr key={subcategory.id} style={styles.subcategoryRow}>
                    <td style={{...styles.td, paddingLeft: '30px'}}>{subcategory.nombre}</td>
                    <td style={styles.td}>{subcategory.descripcion}</td>
                    <td style={styles.td}>
                      <button onClick={() => setEditingSubcategory(subcategory)} style={styles.actionButton}>Editar</button>
                      <button onClick={() => handleDeleteSubcategory(subcategory.id)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
                    </td>
                  </tr>
                ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}