import { useState, useEffect } from 'preact/hooks';
import { useAPI } from '../Context'; // Adjust the import path as needed
import { FunctionComponent } from 'preact';

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
// Types
type Categoria = {
  id?: string;
  nombre: string;
  descripcion?: string;
};

type Subcategoria = {
  id?: string;
  nombre: string;
  descripcion?: string;
  categoriaId: string;
};

type Servicio = {
  id?: string;
  nombre: string;
  prioridad: number;
  descripcion?: string;
  categoriaId: string;
  subCategoriaId?: string;
  tiempoEstimado: number;
  activo: boolean;
};

type CategoriaFormData = Omit<Categoria, 'id'>;
type SubcategoriaFormData = Omit<Subcategoria, 'id'>;
type ServicioFormData = Omit<Servicio, 'id'>;

// Styles
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1000px',
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
  tabs: {
    display: 'flex',
    marginBottom: '20px',
  },
  tab: {
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: '#ddd',
    border: '1px solid #ccc',
    borderBottom: 'none',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
  },
  activeTab: {
    backgroundColor: 'white',
    borderBottom: '1px solid white',
  },
};

// Components
const CategoriaForm = ({ onSubmit, initialData, onCancel }: { 
  onSubmit: (data: CategoriaFormData) => void,
  initialData?: Categoria,
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState<CategoriaFormData>(() => ({
    nombre: initialData?.nombre || '',
    descripcion: initialData?.descripcion || '',
  }));

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit(formData);
  };
console.log('initial data:',initialData);
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
      <button type="submit" style={styles.button}>{initialData && Object.keys(initialData).length !== 0 ? 'Actualizar' : 'Añadir'} Categoría</button>
      <button type="button" onClick={onCancel} style={{...styles.button, backgroundColor: '#f44336'}}>Cancelar</button>
    </form>
  );
};

const SubcategoriaForm = ({ onSubmit, initialData, categorias, onCancel }: { 
  onSubmit: (data: SubcategoriaFormData) => void,
  initialData?: Subcategoria,
  categorias: Categoria[],
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState<SubcategoriaFormData>(() => ({
    nombre: initialData?.nombre || '',
    descripcion: initialData?.descripcion || '',
    categoriaId: initialData?.categoriaId || '',
  }));

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit(formData);
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
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
        ))}
      </select>
      <button type="submit" style={styles.button}>{initialData && Object.keys(initialData).length !== 0 ? 'Actualizar' : 'Añadir'} Subcategoría</button>
      <button type="button" onClick={onCancel} style={{...styles.button, backgroundColor: '#f44336'}}>Cancelar</button>
    </form>
  );
};

const ServicioForm = ({ onSubmit, categories, subcategories, initialData, onCancel }: { 
  onSubmit: (data: ServicioFormData) => void, 
  categories: Categoria[], 
  subcategories: Subcategoria[],
  initialData?: Servicio,
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState<ServicioFormData>(() => ({
    nombre: initialData?.nombre || '',
    prioridad: initialData?.prioridad || 0,
    descripcion: initialData?.descripcion || '',
    categoriaId: initialData?.categoriaId || '',
    subCategoriaId: initialData?.subCategoriaId || '',
    tiempoEstimado: initialData?.tiempoEstimado || 0,
    activo: initialData?.activo ?? true
  }));

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit(formData);
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
        onChange={(e) => setFormData({ ...formData, categoriaId: (e.target as HTMLSelectElement).value, subCategoriaId: '' })}
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
      <input
        type="number"
        value={formData.prioridad}
        onChange={(e) => setFormData({ ...formData, prioridad: Number((e.target as HTMLInputElement).value||0) })}
        placeholder="Prioridad"
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
      <button type="submit" style={styles.button}>{initialData && Object.keys(initialData).length !== 0 ? 'Actualizar' : 'Añadir'} Servicio</button>
      <button type="button" onClick={onCancel} style={{...styles.button, backgroundColor: '#f44336'}}>Cancelar</button>
    </form>
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
export  function Servicios() {
  const { apiCall, isAuthenticated, login } = useAPI();
  const [activeTab, setActiveTab] = useState('categorias');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [editingItem, setEditingItem] = useState<Categoria | Subcategoria | Servicio | null>(null);
  const [deletingItem, setDeletingItem] = useState<Categoria | Subcategoria | Servicio | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategorias();
      fetchSubcategorias();
      fetchServicios();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (editingItem) {
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  }, [editingItem]);

  const fetchCategorias = async () => {
    try {
      const data = await apiCall<Categoria[]>('/api/categorias');
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  const fetchSubcategorias = async () => {
    try {
      const data = await apiCall<Subcategoria[]>('/api/subcategorias');
      setSubcategorias(data);
    } catch (error) {
      console.error('Error fetching subcategorias:', error);
    }
  };

  const fetchServicios = async () => {
    try {
      const data = await apiCall<Servicio[]>('/api/servicios');
      setServicios(data);
    } catch (error) {
      console.error('Error fetching servicios:', error);
    }
  };

  const handleSubmit = async (data: CategoriaFormData | SubcategoriaFormData | ServicioFormData) => {
    try {
      let endpoint = '';
      let method = 'POST';
      
      if (editingItem && editingItem.id) {
        endpoint = `/${editingItem.id}`;
        method = 'PUT';
      }
      
      switch (activeTab) {
        case 'categorias':
          await apiCall<Categoria>(`/api/categorias${endpoint}`, method, data);
          fetchCategorias();
          break;
        case 'subcategorias':
          await apiCall<Subcategoria>(`/api/subcategorias${endpoint}`, method, data);
          fetchSubcategorias();
          break;
        case 'servicios':
          await apiCall<Servicio>(`/api/servicios${endpoint}`, method, data);
          fetchServicios();
          break;
      }
      
      setEditingItem(null);
      setShowForm(false);
    } catch (error) {
      console.error(`Error submitting ${activeTab}:`, error);
    }
  };

  const handleDelete = async () => {
    if (deletingItem) {
      try {
        let endpoint = '';
        switch (activeTab) {
          case 'categorias':
            endpoint = `/api/categorias/${deletingItem.id}`;
            break;
          case 'subcategorias':
            endpoint = `/api/subcategorias/${deletingItem.id}`;
            break;
          case 'servicios':
            endpoint = `/api/servicios/${deletingItem.id}`;
            break;
        }
        await apiCall(endpoint, 'DELETE');
        fetchCategorias();
        fetchSubcategorias();
        fetchServicios();
        setDeletingItem(null);
      } catch (error) {
        console.error(`Error deleting ${activeTab}:`, error);
      }
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
        <h1 style={styles.title}>Por favor, inicie sesión para gestionar categorías, subcategorías y servicios</h1>
        <button onClick={handleLogin} style={styles.button}>Iniciar Sesión</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gestión de Categorías, Subcategorías y Servicios</h2>
      
      <div style={styles.tabs}>
        <div 
          style={{...styles.tab, ...(activeTab === 'categorias' ? styles.activeTab : {})}} 
          onClick={() =>{ 
            setActiveTab('categorias'); 
            setShowForm(false);
          }}
        >
          Categorías
        </div>
        <div 
          style={{...styles.tab, ...(activeTab === 'subcategorias' ? styles.activeTab : {})}} 
          onClick={() => {
            setActiveTab('subcategorias');
            setShowForm(false);
          }}
        >
          Subcategorías
        </div>
        <div 
          style={{...styles.tab, ...(activeTab === 'servicios' ? styles.activeTab : {})}} 
          onClick={() => {
            setActiveTab('servicios');
            setShowForm(false);
          }}
        >
          Servicios
        </div>
      </div>

      {!showForm && (
        <button onClick={() => setEditingItem({} as Servicio)} style={styles.button}>
          Añadir {activeTab.slice(0, -1)}
        </button>
      )}

      {showForm && (
        activeTab === 'categorias' ? (
          <CategoriaForm 
            onSubmit={handleSubmit}
            initialData={editingItem as Categoria}
            onCancel={() => {
              setEditingItem(null);
              setShowForm(false);
            }}
          />
        ) : activeTab === 'subcategorias' ? (
          <SubcategoriaForm 
            onSubmit={handleSubmit}
            initialData={editingItem as Subcategoria}
            categorias={categorias}
            onCancel={() => {
              setEditingItem(null);
              setShowForm(false);
            }}
          />
        ) : (
          <ServicioForm 
            onSubmit={handleSubmit}
            categories={categorias}
            subcategories={subcategorias}
            initialData={editingItem as Servicio}
            onCancel={() => {
              setEditingItem(null);
              setShowForm(false);
            }}
          />
        )
      )}
      
      <h3 style={styles.title}>Lista de {activeTab}</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Descripción</th>
            {activeTab === 'subcategorias' && <th style={styles.th}>Categoría</th>}
            {activeTab === 'servicios' && (
              <>
                <th style={styles.th}>Categoría</th>
                <th style={styles.th}>Subcategoría</th>
                <th style={styles.th}>Tiempo Estimado</th>
                <th style={styles.th}>Prioridad</th>
                <th style={styles.th}>Activo</th>
              </>
            )}
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activeTab === 'categorias' && categorias.map((categoria) => (
            <tr key={categoria.id}>
              <td style={styles.td}>{categoria.nombre}</td>
              <td style={styles.td}>{categoria.descripcion}</td>
              <td style={styles.td}>
                <button onClick={() => {
                  setShowForm(false);
                  setEditingItem(categoria);
                }} style={styles.actionButton}>Editar</button>
                <button onClick={() => setDeletingItem(categoria)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
              </td>
            </tr>
          ))}
          {activeTab === 'subcategorias' && subcategorias.map((subcategoria) => (
            <tr key={subcategoria.id}>
              <td style={styles.td}>{subcategoria.nombre}</td>
              <td style={styles.td}>{subcategoria.descripcion}</td>
              <td style={styles.td}>{categorias.find(c => c.id === subcategoria.categoriaId)?.nombre}</td>
              <td style={styles.td}>
                <button onClick={() => {
                  setShowForm(false);
                  setEditingItem(subcategoria);
                }} style={styles.actionButton}>Editar</button>
                <button onClick={() => setDeletingItem(subcategoria)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
              </td>
            </tr>
          ))}
          {activeTab === 'servicios' && servicios.map((servicio) => (
            <tr key={servicio.id}>
              <td style={styles.td}>{servicio.nombre}</td>
              <td style={styles.td}>{servicio.descripcion}</td>
              <td style={styles.td}>{categorias.find(c => c.id === servicio.categoriaId)?.nombre}</td>
              <td style={styles.td}>{subcategorias.find(s => s.id === servicio.subCategoriaId)?.nombre}</td>
              <td style={styles.td}>{servicio.tiempoEstimado} minutos</td>
              <td style={styles.td}>{servicio.prioridad}</td>
              <td style={styles.td}>{servicio.activo ? 'Sí' : 'No'}</td>
              <td style={styles.td}>
                <button onClick={() => {
                  setShowForm(false);
                  setEditingItem(servicio);
                }} style={styles.actionButton}>Editar</button>
                <button onClick={() => setDeletingItem(servicio)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deletingItem && (
        <ConfirmationModal
          message={`¿Está seguro de que desea eliminar ${activeTab === 'categorias' ? 'la categoría' : activeTab === 'subcategorias' ? 'la subcategoría' : 'el servicio'} "${deletingItem.nombre}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </div>
  );
}