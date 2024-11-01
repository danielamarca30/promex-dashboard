import { useState, useEffect } from 'preact/hooks';
import { useAPI } from '../Context'; // Adjust the import path as needed

type Usuario = {
    id?: string;
    username: string;
    password?: string;
    email: string,
    rolId: string,
    empleadoId: string | Empleado,
    activo: boolean,
}

type Empleado = {
    id?: string;
    nombres: string;
    apellidos: string;
    estado: 'Disponible' | 'Ocupado';
    usuarios: Usuario[];
  };

  type EmpleadoFormData = Omit<Empleado, 'id' | 'usuarios'>;

  type UsuarioFormData = Omit<Usuario, 'id' >;

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
const EmpleadoForm = ({ onSubmit, initialData }: { 
    onSubmit: (data: EmpleadoFormData) => void,
    initialData?: Empleado,
}) => {
    const [formData, setFormData] = useState<EmpleadoFormData>(() => {
        if (initialData) {
            return {
                nombres: initialData.nombres,
                apellidos: initialData.apellidos,
                estado: initialData.estado,
            };
        }
        return {
            nombres: '', 
            apellidos: '', 
            estado: 'Disponible',
        };
    });

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
        </form>
    );
};

const UsuarioForm = ({ onSubmit, initialData, roles}: { 
    onSubmit: (data: UsuarioFormData) => void,
    initialData?: Usuario,
    roles: { id: string; nombre: string }[]
}) => {
    const [formData, setFormData] = useState<UsuarioFormData>(() => {
        if (initialData) {
            return {
                username: initialData.username,
                email: initialData.email,
                rolId: initialData.rolId,
                activo: initialData.activo,
                password: '',
                empleadoId:initialData.empleadoId
            };
        }
        return {
            username: '',
            email: '',
            rolId: '',
            activo: true,
            password: '',
            empleadoId:''
        };
    });

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
        </form>
    );
};

export function Empleado() {
    const { apiCall, isAuthenticated, login } = useAPI();
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
    const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
    const [roles, setRoles] = useState<{ id: string; nombre: string }[]>([]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchEmpleados();
            fetchRoles();
        }
    }, [isAuthenticated]);

    const fetchEmpleados = async () => {
        try {
            const data = await apiCall<Empleado[]>('/api/empleados-con-usuarios');
            setEmpleados(data);
        } catch (error) {
            console.error('Error fetching empleados:', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const data = await apiCall<{ id: string; nombre: string }[]>('/api/roles');
            setRoles(data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleAddEmpleado = async (empleado: EmpleadoFormData) => {
        try {
            await apiCall<Empleado>('/api/empleados', 'POST', empleado);
            fetchEmpleados();
        } catch (error) {
            console.error('Error adding empleado:', error);
        }
    };
    
    const handleUpdateEmpleado = async (empleado: EmpleadoFormData) => {
        if (!editingEmpleado) return;
        try {
            await apiCall<Empleado>(`/api/empleados/${editingEmpleado.id}`, 'PUT', empleado);
            fetchEmpleados();
            setEditingEmpleado(null);
        } catch (error) {
            console.error('Error updating empleado:', error);
        }
    };

    const handleAddUsuario = async (usuario: UsuarioFormData, empleadoId: string) => {
        try {
            await apiCall<Usuario>('/api/usuarios', 'POST', { ...usuario, empleadoId });
            fetchEmpleados();
        } catch (error) {
            console.error('Error adding usuario:', error);
        }
    };

    const handleUpdateUsuario = async (usuario: UsuarioFormData) => {
        if (!editingUsuario) return;
        try {
            const updateData = { ...usuario, empleadoId: editingUsuario.empleadoId };
            if (!updateData.password) {
                delete updateData.password;
            }
            await apiCall<Usuario>(`/api/usuarios/${editingUsuario.id}`, 'PUT', updateData);
            fetchEmpleados();
            setEditingUsuario(null);
        } catch (error) {
            console.error('Error updating usuario:', error);
        }
    };

    const handleDeleteEmpleado = async (id: string) => {
        try {
            const empleado = empleados.find(e => e.id === id);
            if (empleado) {
                for (const usuario of empleado.usuarios) {
                    await apiCall(`/api/usuarios/${usuario.id}`, 'DELETE');
                }
            }
            await apiCall(`/api/empleados/${id}`, 'DELETE');
            fetchEmpleados();
        } catch (error) {
            console.error('Error deleting empleado:', error);
        }
    };

    const handleDeleteUsuario = async (id: string) => {
        try {
            await apiCall(`/api/usuarios/${id}`, 'DELETE');
            fetchEmpleados();
        } catch (error) {
            console.error('Error deleting usuario:', error);
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
            
            <h2 style={styles.title}>Añadir Empleado</h2>
            <EmpleadoForm onSubmit={handleAddEmpleado} />
            
            {editingEmpleado && (
                <div>
                    <h3 style={styles.title}>Editar Empleado</h3>
                    <EmpleadoForm 
                        onSubmit={handleUpdateEmpleado}
                        initialData={editingEmpleado}
                    />
                    <button onClick={() => setEditingEmpleado(null)} style={styles.button}>Cancelar Edición</button>
                </div>
            )}

            <h2 style={styles.title}>Lista de Empleados y Usuarios</h2>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Nombres</th>
                        <th style={styles.th}>Apellidos</th>
                        <th style={styles.th}>Estado</th>
                        <th style={styles.th}>Usuarios</th>
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
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Email</th>
                                            <th>Rol</th>
                                            <th>Activo</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {empleado.usuarios.map((usuario) => {
                                            return(
                                            <tr key={usuario.id}>
                                                <td>{usuario.username}</td>
                                                <td>{usuario.email}</td>
                                                <td>{roles.find(r => r.id === usuario.rolId)?.nombre || 'N/A'}</td>
                                                <td>{usuario.activo ? 'Sí' : 'No'}</td>
                                                <td>
                                                    <button onClick={() => {setEditingUsuario(usuario)}} style={styles.actionButton}>Editar</button>
                                                    <button onClick={() => handleDeleteUsuario(usuario.id!)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
                                                </td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                                <UsuarioForm 
                                    onSubmit={(data) => handleAddUsuario(data, empleado.id!)}
                                    roles={roles}
                                />
                            </td>
                            <td style={styles.td}>
                                <button onClick={() => setEditingEmpleado(empleado)} style={styles.actionButton}>Editar</button>
                                <button onClick={() => handleDeleteEmpleado(empleado.id!)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>


            {editingUsuario && (
                <div>
                    <h3 style={styles.title}>Editar Usuario</h3>
                    <UsuarioForm 
                        onSubmit={handleUpdateUsuario}
                        initialData={editingUsuario}
                        roles={roles}
                    />
                    <button onClick={() => setEditingUsuario(null)} style={styles.button}>Cancelar Edición</button>
                </div>
            )}
        </div>
    );
}