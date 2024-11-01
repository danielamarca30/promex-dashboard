import { useState, useEffect } from 'preact/hooks';
import { useAPI } from '../Context'; // Adjust the import path as needed
import { FunctionComponent } from 'preact';

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
// Types
type Ficha = {
  id: string;
  codigo: string;
  estado: 'Pendiente' | 'Llamado' | 'En_Atencion' | 'Atendido' | 'No_Presentado' | 'Cancelado';
  createdAt: string;
  servicioId: string;
  empleadoId?: string;
  puntoAtencionId?: string;
};

type FichaFormData = Omit<Ficha, 'id' | 'codigo' | 'createdAt'>;

type Servicio = {
  id: string;
  nombre: string;
};

type Empleado = {
  id: string;
  nombres: string;
  apellidos: string;
};

type PuntoAtencion = {
  id: string;
  nombre: string;
};

// Estilos
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
  }
};

// Components
const FichaForm = ({ onSubmit, servicios, empleados, puntosAtencion, initialData, onCancel }: { 
  onSubmit: (data: FichaFormData) => void, 
  servicios: Servicio[],
  empleados: Empleado[],
  puntosAtencion: PuntoAtencion[],
  initialData?: Ficha,
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState<FichaFormData>(() => ({
    servicioId: initialData?.servicioId || '',
    empleadoId: initialData?.empleadoId || '',
    puntoAtencionId: initialData?.puntoAtencionId || '',
    estado: initialData?.estado || 'Pendiente',
  }));

  useEffect(() => {
    if (initialData) {
      setFormData({
        servicioId: initialData.servicioId,
        empleadoId: initialData.empleadoId || '',
        puntoAtencionId: initialData.puntoAtencionId || '',
        estado: initialData.estado,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <select
        value={formData.servicioId}
        onChange={(e) => setFormData({ ...formData, servicioId: (e.target as HTMLSelectElement).value })}
        required
        style={styles.select}
      >
        <option value="">Seleccione un servicio</option>
        {servicios.map((servicio) => (
          <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
        ))}
      </select>
      <select
        value={formData.empleadoId}
        onChange={(e) => setFormData({ ...formData, empleadoId: (e.target as HTMLSelectElement).value })}
        style={styles.select}
      >
        <option value="">Seleccione un empleado (opcional)</option>
        {empleados.map((empleado) => (
          <option key={empleado.id} value={empleado.id}>{`${empleado.nombres} ${empleado.apellidos}`}</option>
        ))}
      </select>
      <select
        value={formData.puntoAtencionId}
        onChange={(e) => setFormData({ ...formData, puntoAtencionId: (e.target as HTMLSelectElement).value })}
        style={styles.select}
      >
        <option value="">Seleccione un punto de atención (opcional)</option>
        {puntosAtencion.map((punto) => (
          <option key={punto.id} value={punto.id}>{punto.nombre}</option>
        ))}
      </select>
      <select
        value={formData.estado}
        onChange={(e) => setFormData({ ...formData, estado: (e.target as HTMLSelectElement).value as Ficha['estado'] })}
        required
        style={styles.select}
      >
        <option value="Pendiente">Pendiente</option>
        <option value="Llamado">Llamado</option>
        <option value="En_Atencion">En Atención</option>
        <option value="Atendido">Atendido</option>
        <option value="No_Presentado">No Presentado</option>
        <option value="Cancelado">Cancelado</option>
      </select>
      <button type="submit" style={styles.button}>{initialData ? 'Actualizar' : 'Añadir'} Ficha</button>
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

export function Fichas() {
  const { apiCall, isAuthenticated, login } = useAPI();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [puntosAtencion, setPuntosAtencion] = useState<PuntoAtencion[]>([]);
  const [editingFicha, setEditingFicha] = useState<Ficha | null>(null);
  const [deletingFicha, setDeletingFicha] = useState<Ficha | null>(null);
  const [showFichaForm, setShowFichaForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFichas();
      fetchServicios();
      fetchEmpleados();
      fetchPuntosAtencion();
    }
  }, [isAuthenticated]);

  const fetchFichas = async () => {
    try {
      const data = await apiCall<Ficha[]>('/api/ficha/fichas-del-dia');
      console.log('fichas del dia',data);
      const newTickets = await apiCall<any>('/api/ficha/recientes');
console.log('nuevos tickestss',newTickets);
      setFichas(data);
    } catch (error) {
      console.error('Error fetching fichas:', error);
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

  const fetchEmpleados = async () => {
    try {
      const data = await apiCall<Empleado[]>('/api/empleados');
      setEmpleados(data);
    } catch (error) {
      console.error('Error fetching empleados:', error);
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

  const handleSubmitFicha = async (ficha: FichaFormData) => {
    try {
      if (editingFicha) {
        await apiCall<Ficha>(`/api/ficha/${editingFicha.id}`, 'PUT', ficha);
      } else {
        await apiCall<Ficha>('/api/ficha', 'POST', ficha);
      }
      fetchFichas();
      setEditingFicha(null);
      setShowFichaForm(false);
    } catch (error) {
      console.error('Error submitting ficha:', error);
    }
  };

  const handleDeleteFicha = async () => {
    if (deletingFicha) {
      try {
        await apiCall(`/api/ficha/${deletingFicha.id}`, 'DELETE');
        fetchFichas();
        setDeletingFicha(null);
      } catch (error) {
        console.error('Error deleting ficha:', error);
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
        <h1 style={styles.title}>Por favor, inicie sesión para gestionar fichas</h1>
        <button onClick={handleLogin} style={styles.button}>Iniciar Sesión</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gestión de Fichas</h2>
      
      <button onClick={() => {
        setEditingFicha(null);
        setShowFichaForm(true);
      }} style={styles.button}>
        Añadir Ficha
      </button>

      {showFichaForm && (
        <FichaForm 
          onSubmit={handleSubmitFicha}
          servicios={servicios}
          empleados={empleados}
          puntosAtencion={puntosAtencion}
          initialData={editingFicha || undefined}
          onCancel={() => {
            setEditingFicha(null);
            setShowFichaForm(false);
          }}
        />
      )}
      
      <h3 style={styles.title}>Lista de Fichas</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Código</th>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}>Servicio</th>
            <th style={styles.th}>Empleado</th>
            <th style={styles.th}>Punto de Atención</th>
            <th style={styles.th}>Fecha de Creación</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {fichas.map((ficha) => (
            <tr key={ficha.id}>
              <td style={styles.td}>{ficha.codigo}</td>
              <td style={styles.td}>{ficha.estado}</td>
              <td style={styles.td}>{servicios.find(s => s.id === ficha.servicioId)?.nombre}</td>
              <td style={styles.td}>
                {ficha.empleadoId ? 
                  `${empleados.find(e => e.id === ficha.empleadoId)?.nombres} ${empleados.find(e => e.id === ficha.empleadoId)?.apellidos}` : 
                  'No asignado'
                }
              </td>
              <td style={styles.td}>{puntosAtencion.find(p => p.id === ficha.puntoAtencionId)?.nombre || 'No asignado'}</td>
              <td style={styles.td}>{new Date(ficha.createdAt).toLocaleString()}</td>
              <td style={styles.td}>
                <button onClick={() => 

 {
                  setEditingFicha(ficha);
                  setShowFichaForm(true);
                }} style={styles.actionButton}>Editar</button>
                <button onClick={() => setDeletingFicha(ficha)} style={{...styles.actionButton, ...styles.deleteButton}}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deletingFicha && (
        <ConfirmationModal
          message={`¿Está seguro de que desea eliminar la ficha "${deletingFicha.codigo}"?`}
          onConfirm={handleDeleteFicha}
          onCancel={() => setDeletingFicha(null)}
        />
      )}
    </div>
  );
}