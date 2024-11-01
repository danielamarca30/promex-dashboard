import { useState, useEffect } from 'preact/hooks';
import { useAPI } from '../Context'; // Adjust the import path as needed
import { FunctionComponent } from 'preact';
import { JSX } from 'preact'
  // Lista de todos los permisos posibles
  const allPermissions = [
    'tokenBasico',
    'admin',
    'superAdmin',
    'puntoAtencion',
    'fichas',
    'servicios',
    'usuarios',
    'cotizacion',
    'videos',
    'reportes'
  ]

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
// Types
type Empleado = {
  id?: string;
  nombres: string;
  apellidos: string;
  estado: 'Disponible' | 'Ocupado';
};

type Usuario = {
  id?: string;
  username: string;
  password?: string;
  email: string;
  rolId: string;
  empleadoId: string;
  activo: boolean;
};

type Role = {
  id?: string;
  nombre: string;
  descripcion?: string;
  permisos: string[];
};

type PuntoAtencion = {
  id?: string;
  nombre: string;
  categoriaId: string;
  empleadoId: string | null;
  activo: boolean;
};

// Form Data Types
type EmpleadoFormData = Omit<Empleado, 'id'>;
type UsuarioFormData = Omit<Usuario, 'id'>;
type RoleFormData = Omit<Role, 'id'>;
type PuntoAtencionFormData = Omit<PuntoAtencion, 'id'>;

// Styles
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
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
  checkboxContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
};

// Form Components
const EmpleadoForm = ({ onSubmit, initialData, onCancel }: { 
  onSubmit: (data: EmpleadoFormData) => void,
  initialData?: Empleado,
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState<EmpleadoFormData>(() => ({
    nombres: initialData?.nombres || '',
    apellidos: initialData?.apellidos || '',
    estado: initialData?.estado || 'Disponible',
  }));

  useEffect(() => {
     setFormData({
       nombres: initialData?.nombres || '',
       apellidos: initialData?.apellidos || '',
       estado: initialData?.estado || 'Disponible',
     });
   }, [initialData]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={formData.nombres}
        onChange={(e) => setFormData({ ...formData, nombres: (e.target as HTMLInputElement).value })}
        placeholder="Nombres"
        required
        style={styles.input}
      />
      <input
        type="text"
        value={formData.apellidos}
        onChange={(e) => setFormData({ ...formData, apellidos: (e.target as HTMLInputElement).value })}
        placeholder="Apellidos"
        required
        style={styles.input}
      />
      <select
        value={formData.estado}
        onChange={(e) => setFormData({ ...formData, estado: (e.target as HTMLSelectElement).value as 'Disponible' | 'Ocupado' })}
        style={styles.select}
      >
        <option value="Disponible">Disponible</option>
        <option value="Ocupado">Ocupado</option>
      </select>
      <button type="submit" style={styles.button}>
        {initialData && Object.keys(initialData).length > 0 ? 'Actualizar' : 'Añadir'} Empleado
      </button>
      <button type="button" onClick={onCancel} style={{...styles.button, backgroundColor: '#f44336'}}>Cancelar</button>
    </form>
  );
};

const UsuarioForm = ({ onSubmit, initialData, roles, empleados, onCancel }: { 
  onSubmit: (data: UsuarioFormData) => void,
  initialData?: Usuario,
  roles: Role[],
  empleados: Empleado[],
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState<UsuarioFormData>(() => ({
    username: initialData?.username || '',
    email: initialData?.email || '',
    rolId: initialData?.rolId || '',
    empleadoId: initialData?.empleadoId || '',
    activo: initialData?.activo ?? true,
    password: '',
  }));

  useEffect(() => {
     setFormData({
       username: initialData?.username || '',
       email: initialData?.email || '',
       rolId: initialData?.rolId || '',
       empleadoId: initialData?.empleadoId || '',
       activo: initialData?.activo ?? true,
       password: '',
     });
   }, [initialData]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: (e.target as HTMLInputElement).value })}
        placeholder="Nombre de usuario"
        required
        style={styles.input}
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: (e.target as HTMLInputElement).value })}
        placeholder="Email"
        required
        style={styles.input}
      />
      <select
        value={formData.rolId}
        onChange={(e) => setFormData({ ...formData, rolId: (e.target as HTMLSelectElement).value })}
        style={styles.select}
        required
      >
        <option value="">Seleccione un rol</option>
        {roles.map(role => (
          <option key={role.id} value={role.id}>{role.nombre}</option>
        ))}
      </select>
      <select
        value={formData.empleadoId}
        onChange={(e) => setFormData({ ...formData, empleadoId: (e.target as HTMLSelectElement).value })}
        style={styles.select}
        required
      >
        <option value="">Seleccione un empleado</option>
        {empleados.map(empleado => (
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
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: (e.target as HTMLInputElement).value })}
        placeholder={initialData ? "Nueva contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
        required={!initialData}
        style={styles.input}
      />
      <button type="submit" style={styles.button}>
        {initialData && Object.keys(initialData).length > 0 ? 'Actualizar' : 'Añadir'} Usuario
      </button>
      <button type="button" onClick={onCancel} style={{...styles.button, backgroundColor: '#f44336'}}>Cancelar</button>
    </form>
  );
};

  interface RoleFormProps {
    onSubmit: (data: RoleFormData) => void
    initialData?: RoleFormData
    onCancel: () => void
  }
  

 function RoleForm({ onSubmit, initialData, onCancel }: RoleFormProps) {
    const [formData, setFormData] = useState<RoleFormData>(() => ({
      nombre: initialData?.nombre || '',
      descripcion: initialData?.descripcion || '',
      permisos: [],
    }))
  
    useEffect(() => {
      if (initialData) {
        setFormData({
          nombre: initialData.nombre || '',
          descripcion: initialData.descripcion || '',
          permisos: Array.isArray(initialData.permisos) 
            ? initialData.permisos.filter(p => allPermissions.includes(p))
            : [],
        })
      }
    }, [initialData])
  
    const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
      e.preventDefault()
      onSubmit(formData)
    }
  
    const handlePermissionChange = (permission: string) => {
      setFormData(prevData => {
        const newPermisos = prevData.permisos.includes(permission)
          ? prevData.permisos.filter(p => p !== permission)
          : [...prevData.permisos, permission]
        return {
          ...prevData,
          permisos: newPermisos
        }
      })
    }
  
    return (
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => setFormData(prev => ({ ...prev, nombre: (e.target as HTMLInputElement).value }))}
          placeholder="Nombre del rol"
          required
          style={styles.input}
        />
        <input
          type="text"
          value={formData.descripcion}
          onChange={(e) => setFormData(prev => ({ ...prev, descripcion: (e.target as HTMLInputElement).value }))}
          placeholder="Descripción"
          style={styles.input}
        />
        <div>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Permisos:</p>
          <div style={styles.checkboxContainer}>
            {allPermissions.map(permission => (
              <label key={permission} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.permisos.includes(permission)}
                  onChange={() => handlePermissionChange(permission)}
                />
                <span>{permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </label>
            ))}
          </div>
        </div>
      <button type="submit" style={styles.button}>
        {initialData && Object.keys(initialData).length > 0 ? 'Actualizar' : 'Añadir'} Punto de Atención
      </button>
      <button type="button" onClick={onCancel} style={{...styles.button, backgroundColor: '#f44336'}}>Cancelar</button>
      </form>
    )
  }
const PuntoAtencionForm = ({ onSubmit, categories, empleados, initialData, onCancel }: { 
  onSubmit: (data: PuntoAtencionFormData) => void, 
  categories: { id: string; nombre: string }[], 
  empleados: Empleado[],
  initialData?: PuntoAtencion,
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState<PuntoAtencionFormData>(() => ({
    nombre: initialData?.nombre || '',
    categoriaId: initialData?.categoriaId || '',
    empleadoId: initialData?.empleadoId || null,
    activo: initialData?.activo ?? true,
  }));

  useEffect(() => {
    setFormData({
      nombre: initialData?.nombre || '',
      categoriaId: initialData?.categoriaId || '',
      empleadoId: initialData?.empleadoId || null,
      activo: initialData?.activo ?? true,
    });
  }, [initialData]);

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
        required
      >
        <option value="">Seleccione un empleado</option>
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
      <button type="submit" style={styles.button}>
        {initialData && Object.keys(initialData).length > 0 ? 'Actualizar' : 'Añadir'} Punto de Atención
      </button>
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
export  function Empleado() {
  const { apiCall, isAuthenticated, login } = useAPI();
  const [activeTab, setActiveTab] = useState('empleados');
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [puntosAtencion, setPuntosAtencion] = useState<PuntoAtencion[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (editingItem) {
      setShowForm(true);
    }
  }, [editingItem]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchEmpleados(),
      fetchUsuarios(),
      fetchRoles(),
      fetchPuntosAtencion(),
      fetchCategories(),
    ]);
  };

  const fetchEmpleados = async () => {
    try {
      const data = await apiCall<Empleado[]>('/api/empleados');
      setEmpleados(data);
    } catch (error) {
      console.error('Error fetching empleados:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const data = await apiCall<Usuario[]>('/api/usuarios');
      setUsuarios(data);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await apiCall<Role[]>('/api/roles');
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

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
      const data = await apiCall<{ id: string; nombre: string }[]>('/api/categorias');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      let endpoint = '';
      let method = 'POST';
      
      if (editingItem && editingItem.id) {
        endpoint = `/${editingItem.id}`;
        method = 'PUT';
      }
      
      switch (activeTab) {
        case 'empleados':
          await apiCall<Empleado>(`/api/empleados${endpoint}`, method, data);
          fetchEmpleados();
          break;
        case 'usuarios':
          await apiCall<Usuario>(`/api/usuarios${endpoint}`, method, data);
          fetchUsuarios();
          break;
        case 'roles':
          await apiCall<Role>(`/api/roles${endpoint}`, method, data);
          fetchRoles();
          break;
        case 'puntosAtencion':
          await apiCall<PuntoAtencion>(`/api/puntos-atencion${endpoint}`, method, data);
          fetchPuntosAtencion();
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
          case 'empleados':
            endpoint = `/api/empleados/${deletingItem.id}`;
            break;
          case 'usuarios':
            endpoint = `/api/usuarios/${deletingItem.id}`;
            break;
          case 'roles':
            endpoint = `/api/roles/${deletingItem.id}`;
            break;
          case 'puntosAtencion':
            endpoint = `/api/puntos-atencion/${deletingItem.id}`;
            break;
        }
        await apiCall(endpoint, 'DELETE');
        fetchAllData();
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
        <h1 style={styles.title}>Por favor, inicie sesión para gestionar el sistema</h1>
        <button onClick={handleLogin} style={styles.button}>Iniciar Sesión</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Sistema de Gestión Unificado</h2>
      
      <div style={styles.tabs}>
        <div 
          style={{...styles.tab, ...(activeTab === 'empleados' ? styles.activeTab : {})}} 
          onClick={() => {
            setShowForm(false);
            setActiveTab('empleados');
        }}
        >
          Empleados
        </div>
        <div 
          style={{...styles.tab, ...(activeTab === 'usuarios' ? styles.activeTab : {})}} 
          onClick={() => {
            setShowForm(false);
            setActiveTab('usuarios');
        }}
        >
          Usuarios
        </div>
        <div 
          style={{...styles.tab, ...(activeTab === 'roles' ? styles.activeTab : {})}} 
          onClick={() => {
            setShowForm(false);
            setActiveTab('roles');
        }}
        >
          Roles
        </div>
        <div 
          style={{...styles.tab, ...(activeTab === 'puntosAtencion' ? styles.activeTab : {})}} 
          onClick={() => {
            setShowForm(false);
            setActiveTab('puntosAtencion');
        }}        >
          Puntos de Atención
        </div>
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={styles.button}>
          Añadir {activeTab === 'puntosAtencion' ? 'Punto de Atención' : activeTab.slice(0, -1)}
        </button>
      )}

      {showForm && (
        activeTab === 'empleados' ? (
          <EmpleadoForm 
            onSubmit={handleSubmit}
            initialData={editingItem}
            onCancel={() => {
              setEditingItem(null);
              setShowForm(false);
            }}
          />
        ) : activeTab === 'usuarios' ? (
          <UsuarioForm 
            onSubmit={handleSubmit}
            initialData={editingItem}
            roles={roles}
            empleados={empleados}
            onCancel={() => {
              setEditingItem(null);
              setShowForm(false);
            }}
          />
        ) : activeTab === 'roles' ? (
          <RoleForm 
            onSubmit={handleSubmit}
            initialData={editingItem}
            onCancel={() => {
              setEditingItem(null);
              setShowForm(false);
            }}
          />
        ) : (
          <PuntoAtencionForm 
            onSubmit={handleSubmit}
            initialData={editingItem}
            categories={categories}
            empleados={empleados}
            onCancel={() => {
              setEditingItem(null);
              setShowForm(false);
            }}
          />
        )
      )}
      
      <h3 style={styles.title}>Lista de {activeTab === 'puntosAtencion' ? 'Puntos de Atención' : activeTab}</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            {activeTab === 'empleados' && (
              <>
                <th style={styles.th}>Nombres</th>
                <th style={styles.th}>Apellidos</th>
                <th style={styles.th}>Estado</th>
              </>
            )}
            {activeTab === 'usuarios' && (
              <>
                <th style={styles.th}>Usuario</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rol</th>
                <th style={styles.th}>Empleado</th>
                <th style={styles.th}>Activo</th>
              </>
            )}
            {activeTab === 'roles' && (
              <>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Descripción</th>
                <th style={styles.th}>Permisos</th>
              </>
            )}
            {activeTab === 'puntosAtencion' && (
              <>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Categoría</th>
                <th style={styles.th}>Empleado</th>
                <th style={styles.th}>Activo</th>
              </>
            )}
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activeTab === 'empleados' && empleados.map((empleado) => (
            <tr key={empleado.id}>
              <td style={styles.td}>{empleado.nombres}</td>
              <td style={styles.td}>{empleado.apellidos}</td>
              <td style={styles.td}>{empleado.estado}</td>
              <td style={styles.td}>
                <button onClick={() => {
                  setEditingItem(empleado);
                }} style={styles.actionButton}>Editar</button>
                <button onClick={() => setDeletingItem(empleado)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
              </td>
            </tr>
          ))}
          {activeTab === 'usuarios' && usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td style={styles.td}>{usuario.username}</td>
              <td style={styles.td}>{usuario.email}</td>
              <td style={styles.td}>{roles.find(r => r.id === usuario.rolId)?.nombre || 'N/A'}</td>
              <td style={styles.td}>
                {empleados.find(e => e.id === usuario.empleadoId)?.nombres || 'N/A'} {empleados.find(e => e.id === usuario.empleadoId)?.apellidos || ''}
              </td>
              <td style={styles.td}>{usuario.activo ? 'Sí' : 'No'}</td>
              <td style={styles.td}>
                <button onClick={() => {
                  setEditingItem(usuario);
                }} style={styles.actionButton}>Editar</button>
                <button onClick={() => setDeletingItem(usuario)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
              </td>
            </tr>
          ))}
          {activeTab === 'roles' && roles.map((role) => (
            <tr key={role.id}>
              <td style={styles.td}>{role.nombre}</td>
              <td style={styles.td}>{role.descripcion}</td>
              <td style={styles.td}>{role.permisos}</td>
              <td style={styles.td}>
                <button onClick={() => {
                  setEditingItem(role);
                }} style={styles.actionButton}>Editar</button>
                <button onClick={() => setDeletingItem(role)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
              </td>
            </tr>
          ))}
          {activeTab === 'puntosAtencion' && puntosAtencion.map((punto) => (
            <tr key={punto.id}>
              <td style={styles.td}>{punto.nombre}</td>
              <td style={styles.td}>{categories.find(c => c.id === punto.categoriaId)?.nombre || 'N/A'}</td>
              <td style={styles.td}>
                {punto.empleadoId 
                  ? empleados.find(e => e.id === punto.empleadoId)?.nombres + ' ' + empleados.find(e => e.id === punto.empleadoId)?.apellidos
                  : 'No asignado'}
              </td>
              <td style={styles.td}>{punto.activo ? 'Sí' : 'No'}</td>
              <td style={styles.td}>
                <button onClick={() => {
                  setEditingItem(punto);
                }} style={styles.actionButton}>Editar</button>
                <button onClick={() => setDeletingItem(punto)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deletingItem && (
        <ConfirmationModal
          message={`¿Está seguro de que desea eliminar este ${activeTab === 'puntosAtencion' ? 'punto de atención' : activeTab.slice(0, -1)}?`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </div>
  );
}