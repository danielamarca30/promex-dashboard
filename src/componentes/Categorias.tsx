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

type CategoriaFormData = Omit<Categoria, 'id'>;
type SubcategoriaFormData = Omit<Subcategoria, 'id'>;

// Styles (reusing the styles from the previous components)
// Estilos
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '700px',
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
            <button type="submit" style={styles.button}>{initialData ? 'Actualizar' : 'Añadir'} Subcategoría</button>
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

export function Categorias() {
    const { apiCall, isAuthenticated, login } = useAPI();
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
    const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
    const [editingSubcategoria, setEditingSubcategoria] = useState<Subcategoria | null>(null);
    const [deletingCategoria, setDeletingCategoria] = useState<Categoria | null>(null);
    const [deletingSubcategoria, setDeletingSubcategoria] = useState<Subcategoria | null>(null);
    const [showCategoriaForm, setShowCategoriaForm] = useState(false);
    const [showSubcategoriaForm, setShowSubcategoriaForm] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCategorias();
            fetchSubcategorias();
        }
    }, [isAuthenticated]);

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

    const handleSubmitCategoria = async (categoria: CategoriaFormData) => {
        try {
            if (editingCategoria) {
                await apiCall<Categoria>(`/api/categorias/${editingCategoria.id}`, 'PUT', categoria);
            } else {
                await apiCall<Categoria>('/api/categorias', 'POST', categoria);
            }
            fetchCategorias();
            setEditingCategoria(null);
            setShowCategoriaForm(false);
        } catch (error) {
            console.error('Error submitting categoria:', error);
        }
    };

    const handleSubmitSubcategoria = async (subcategoria: SubcategoriaFormData) => {
        try {
            if (editingSubcategoria) {
                await apiCall<Subcategoria>(`/api/subcategorias/${editingSubcategoria.id}`, 'PUT', subcategoria);
            } else {
                await apiCall<Subcategoria>('/api/subcategorias', 'POST', subcategoria);
            }
            fetchSubcategorias();
            setEditingSubcategoria(null);
            setShowSubcategoriaForm(false);
        } catch (error) {
            console.error('Error submitting subcategoria:', error);
        }
    };

    const handleDeleteCategoria = async () => {
        if (deletingCategoria) {
            try {
                await apiCall(`/api/categorias/${deletingCategoria.id}`, 'DELETE');
                fetchCategorias();
                fetchSubcategorias(); // Refresh subcategorias in case any were deleted due to cascade
                setDeletingCategoria(null);
            } catch (error) {
                console.error('Error deleting categoria:', error);
            }
        }
    };

    const handleDeleteSubcategoria = async () => {
        if (deletingSubcategoria) {
            try {
                await apiCall(`/api/subcategorias/${deletingSubcategoria.id}`, 'DELETE');
                fetchSubcategorias();
                setDeletingSubcategoria(null);
            } catch (error) {
                console.error('Error deleting subcategoria:', error);
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
                <h1 style={styles.title}>Por favor, inicie sesión para gestionar categorías y subcategorías</h1>
                <button onClick={handleLogin} style={styles.button}>Iniciar Sesión</button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Gestión de Categorías y Subcategorías</h2>
            
            <button onClick={() => setShowCategoriaForm(true)} style={styles.button}>
                {editingCategoria ? 'Editar' : 'Añadir'} Categoría
            </button>
            <button onClick={() => setShowSubcategoriaForm(true)} style={styles.button}>
                {editingSubcategoria ? 'Editar' : 'Añadir'} Subcategoría
            </button>

            {showCategoriaForm && (
                <CategoriaForm 
                    onSubmit={handleSubmitCategoria}
                    initialData={editingCategoria || undefined}
                    onCancel={() => {
                        setEditingCategoria(null);
                        setShowCategoriaForm(false);
                    }}
                />
            )}

            {showSubcategoriaForm && (
                <SubcategoriaForm 
                    onSubmit={handleSubmitSubcategoria}
                    initialData={editingSubcategoria || undefined}
                    categorias={categorias}
                    onCancel={() => {
                        setEditingSubcategoria(null);
                        setShowSubcategoriaForm(false);
                    }}
                />
            )}
            
            <h3 style={styles.title}>Lista de Categorías y Subcategorías</h3>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Nombre</th>
                        <th style={styles.th}>Descripción</th>
                        <th style={styles.th}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {categorias.map((categoria) => (
                        <>
                            <tr key={categoria.id} style={styles.categoryRow}>
                                <td style={styles.td}><strong>{categoria.nombre}</strong></td>
                                <td style={styles.td}>{categoria.descripcion}</td>
                                <td style={styles.td}>
                                    <button onClick={() => {
                                        setEditingCategoria(categoria);
                                        setShowCategoriaForm(true);
                                    }} style={styles.actionButton}>Editar</button>
                                    <button onClick={() => setDeletingCategoria(categoria)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
                                </td>
                            </tr>
                            {subcategorias
                                .filter((subcategoria) => subcategoria.categoriaId === categoria.id)
                                .map((subcategoria) => (
                                    <tr key={subcategoria.id} style={styles.subcategoryRow}>
                                        <td style={{...styles.td, paddingLeft: '30px'}}>{subcategoria.nombre}</td>
                                        <td style={styles.td}>{subcategoria.descripcion}</td>
                                        <td style={styles.td}>
                                            <button onClick={() => {
                                                setEditingSubcategoria(subcategoria);
                                                setShowSubcategoriaForm(true);
                                            }} style={styles.actionButton}>Editar</button>
                                            <button onClick={() => setDeletingSubcategoria(subcategoria)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                        </>
                    ))}
                </tbody>
            </table>

            {deletingCategoria && (
                <ConfirmationModal
                    message={`¿Está seguro de que desea eliminar la categoría "${deletingCategoria.nombre}" y todas sus subcategorías asociadas?`}
                    onConfirm={handleDeleteCategoria}
                    onCancel={() => setDeletingCategoria(null)}
                />
            )}

            {deletingSubcategoria && (
                <ConfirmationModal
                    message={`¿Está seguro de que desea eliminar la subcategoría "${deletingSubcategoria.nombre}"?`}
                    onConfirm={handleDeleteSubcategoria}
                    onCancel={() => setDeletingSubcategoria(null)}
                />
            )}
        </div>
    );
}