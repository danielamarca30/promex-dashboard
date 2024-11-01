import { FunctionComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useAPI } from '../Context'; // Adjust the import path as needed

interface ConfirmationModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }
// Types
type Usuario = {
    id?: string;
    username: string;
    password?: string;
    email: string,
    rolId: string,
    empleadoId: string,
    activo: boolean,
}

type Empleado = {
    id?: string;
    nombres: string;
    apellidos: string;
    estado: 'Disponible' | 'Ocupado';
};
type Role = {
    id?: string;
    nombre: string;
    descripcion?: string;
    permisos: string[];
};

type RoleFormData = Omit<Role, 'id'>;

type EmpleadoFormData = Omit<Empleado, 'id'>;
type UsuarioFormData = Omit<Usuario, 'id'>;

// Styles (reusing the styles from the previous components)

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
            <button type="submit" style={styles.button}>{initialData ? 'Actualizar' : 'Añadir'} Empleado</button>
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
            <button type="submit" style={styles.button}>{initialData ? 'Actualizar' : 'Añadir'} Usuario</button>
            <button type="button" onClick={onCancel} style={{...styles.button, backgroundColor: '#f44336'}}>Cancelar</button>
        </form>
    );
};

const RoleForm = ({ onSubmit, initialData, onCancel }: { 
    onSubmit: (data: RoleFormData) => void,
    initialData?: Role,
    onCancel: () => void
}) => {
    const [formData, setFormData] = useState<RoleFormData>(() => ({
        nombre: initialData?.nombre || '',
        descripcion: initialData?.descripcion || '',
        permisos: initialData?.permisos || [],
    }));

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handlePermissionChange = (permission: string) => {
        setFormData(prevData => ({
            ...prevData,
            permisos: prevData.permisos.includes(permission)
                ? prevData.permisos.filter(p => p !== permission)
                : [...prevData.permisos, permission]
        }));
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: (e.target as HTMLInputElement).value })}
                placeholder="Nombre del rol"
                required
                style={styles.input}
            />
            <input
                type="text"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: (e.target as HTMLInputElement).value })}
                placeholder="Descripción"
                style={styles.input}
            />
            <div>
                <p>Permisos:</p>
                {['crear', 'leer', 'actualizar', 'eliminar'].map(permission => (
                    <label key={permission} style={styles.input}>
                        <input
                            type="checkbox"
                            checked={formData.permisos.includes(permission)}
                            onChange={() => handlePermissionChange(permission)}
                        />
                        {permission.charAt(0).toUpperCase() + permission.slice(1)}
                    </label>
                ))}
            </div>
            <button type="submit" style={styles.button}>{initialData ? 'Actualizar' : 'Añadir'} Rol</button>
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

export function Empleado() {
    const { apiCall, isAuthenticated, login } = useAPI();
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
    const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
    const [editingRol, setEditingRol] = useState<Role | null>(null);
    const [deletingEmpleado, setDeletingEmpleado] = useState<Empleado | null>(null);
    const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);
    const [deletingRol, setDeletingRol] = useState<Role | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [showEmpleadoForm, setShowEmpleadoForm] = useState(false);
    const [showUsuarioForm, setShowUsuarioForm] = useState(false);
    const [showRoleForm, setShowRoleForm] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchEmpleados();
            fetchUsuarios();
            fetchRoles();
        }
    }, [isAuthenticated]);

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
            console.log('usuarios: ',data);
            setUsuarios(data);
        } catch (error) {
            console.error('Error fetching usuarios:', error);
        }
    };
    const fetchRoles = async () => {
        try {
            const data = await apiCall<Role[]>('/api/roles');
            console.log('roles: ',data);
            setRoles(data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleSubmitEmpleado = async (empleado: EmpleadoFormData) => {
        try {
            if (editingEmpleado) {
                await apiCall<Empleado>(`/api/empleados/${editingEmpleado.id}`, 'PUT', empleado);
            } else {
                await apiCall<Empleado>('/api/empleados', 'POST', empleado);
            }
            fetchEmpleados();
            setEditingEmpleado(null);
            setShowEmpleadoForm(false);
        } catch (error) {
            console.error('Error submitting empleado:', error);
        }
    };

    const handleSubmitUsuario = async (usuario: UsuarioFormData) => {
        try {
            if (editingUsuario) {
                const updateData = { ...usuario };
                if (!updateData.password) {
                    delete updateData.password;
                }
                await apiCall<Usuario>(`/api/usuarios/${editingUsuario.id}`, 'PUT', updateData);
            } else {
                await apiCall<Usuario>('/api/usuarios', 'POST', usuario);
            }
            fetchUsuarios();
            setEditingUsuario(null);
            setShowUsuarioForm(false);
        } catch (error) {
            console.error('Error submitting usuario:', error);
        }
    };
    const handleSubmitRole = async (role: RoleFormData) => {
        try {
            if (editingRol) {
                await apiCall<Role>(`/api/roles/${editingRol.id}`, 'PUT', role);
            } else {
                await apiCall<Role>('/api/roles', 'POST', role);
            }
            fetchRoles();
            setEditingRol(null);
            setShowRoleForm(false);
        } catch (error) {
            console.error('Error submitting role:', error);
        }
    };

    const handleDeleteEmpleado = async () => {
        if (deletingEmpleado) {
            try {
                await apiCall(`/api/empleados/${deletingEmpleado.id}`, 'DELETE');
                fetchEmpleados();
                fetchUsuarios(); // Refresh usuarios in case any were deleted due to cascade
                setDeletingEmpleado(null);
            } catch (error) {
                console.error('Error deleting empleado:', error);
            }
        }
    };

    const handleDeleteUsuario = async () => {
        if (deletingUsuario) {
            try {
                await apiCall(`/api/usuarios/${deletingUsuario.id}`, 'DELETE');
                fetchUsuarios();
                setDeletingUsuario(null);
            } catch (error) {
                console.error('Error deleting usuario:', error);
            }
        }
    };
    const handleDeleteRole = async () => {
        if (deletingRol) {
            try {
                await apiCall(`/api/roles/${deletingRol.id}`, 'DELETE');
                fetchRoles();
                fetchUsuarios(); // Refresh usuarios in case any were affected by the role deletion
                setDeletingRol(null);
            } catch (error) {
                console.error('Error deleting role:', error);
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
                <h1 style={styles.title}>Por favor, inicie sesión para gestionar empleados y usuarios</h1>
                <button onClick={handleLogin} style={styles.button}>Iniciar Sesión</button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Gestión de Empleados y Usuarios</h2>
            
            <button onClick={() => setShowEmpleadoForm(true)} style={styles.button}>
                {editingEmpleado ? 'Editar' : 'Añadir'} Empleado
            </button>
            <button onClick={() => setShowUsuarioForm(true)} style={styles.button}>
                {editingUsuario ? 'Editar' : 'Añadir'} Usuario
            </button>
            <button onClick={() => setShowRoleForm(true)} style={styles.button}>
                {editingRol ? 'Editar' : 'Añadir'} Rol
            </button>

            {showEmpleadoForm && (
                <EmpleadoForm 
                    onSubmit={handleSubmitEmpleado}
                    initialData={editingEmpleado || undefined}
                    onCancel={() => {
                        setEditingEmpleado(null);
                        setShowEmpleadoForm(false);
                    }}
                />
            )}

            {showUsuarioForm && (
                <UsuarioForm 
                    onSubmit={handleSubmitUsuario}
                    initialData={editingUsuario || undefined}
                    roles={roles}
                    empleados={empleados}
                    onCancel={() => {
                        setEditingUsuario(null);
                        setShowUsuarioForm(false);
                    }}
                />
            )}
            {showRoleForm && (
                <RoleForm 
                    onSubmit={handleSubmitRole}
                    initialData={editingRol || undefined}
                    onCancel={() => {
                        setEditingUsuario(null);
                        setShowUsuarioForm(false);
                    }}
                />
            )}
            
            <h3 style={styles.title}>Lista de Empleados</h3>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Nombres</th>
                        <th style={styles.th}>Apellidos</th>
                        <th style={styles.th}>Estado</th>
                        <th style={styles.th}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map((empleado) => (
                        <tr key={empleado.id}>
                            <td style={styles.td}>{empleado.nombres}</td>
                            <td style={styles.td}>{empleado.apellidos}</td>
                            <td style={styles.td}>{empleado.estado}</td>
                            <td style={styles.td}>
                                <button onClick={() => {
                                    setEditingEmpleado(empleado);
                                    setShowEmpleadoForm(true);
                                }} style={styles.actionButton}>Editar</button>
                                <button onClick={() => setDeletingEmpleado(empleado)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3 style={styles.title}>Lista de Usuarios</h3>
            <table style={styles.table}>
                <thead>
                    
                    <tr>
                        <th style={styles.th}>Usuario</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Rol</th>
                        <th style={styles.th}>Empleado</th>
                        <th style={styles.th}>Activo</th>
                        <th style={styles.th}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
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
                                    setEditingUsuario(usuario);
                                    setShowUsuarioForm(true);
                                }} style={styles.actionButton}>Editar</button>
                                <button onClick={() => setDeletingUsuario(usuario)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {deletingEmpleado && (
                <ConfirmationModal
                    message={`¿Está seguro de que desea eliminar al empleado ${deletingEmpleado.nombres} ${deletingEmpleado.apellidos}?`}
                    onConfirm={handleDeleteEmpleado}
                    onCancel={() => setDeletingEmpleado(null)}
                />
            )}

            {deletingUsuario && (
                <ConfirmationModal
                    message={`¿Está seguro de que desea eliminar al usuario ${deletingUsuario.username}?`}
                    onConfirm={handleDeleteUsuario}
                    onCancel={() => setDeletingUsuario(null)}
                />
            )}
             <h3 style={styles.title}>Lista de Roles</h3>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Nombre</th>
                        <th style={styles.th}>Descripción</th>
                        <th style={styles.th}>Permisos</th>
                        <th style={styles.th}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map((role) => (
                        <tr key={role.id}>
                            <td style={styles.td}>{role.nombre}</td>
                            <td style={styles.td}>{role.descripcion}</td>
                            <td style={styles.td}>{role.permisos}</td>
                            <td style={styles.td}>
                                <button onClick={() => {
                                    setEditingRol(role);
                                    setShowRoleForm(true);
                                }} style={styles.actionButton}>Editar</button>
                                <button onClick={() => setDeletingRol(role)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Existing ConfirmationModals for Empleado and Usuario... */}

            {deletingRol && (
                <ConfirmationModal
                    message={`¿Está seguro de que desea eliminar el rol ${deletingRol.nombre}?`}
                    onConfirm={handleDeleteRole}
                    onCancel={() => setDeletingRol(null)}
                />
            )}
        </div>
    );
}