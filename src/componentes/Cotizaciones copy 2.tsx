"use client"

import { FunctionComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';
import { useAPI } from '../Context'; // Adjust the import path as needed

// Types
interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

type Comunicado = {
  id: string;
  comunicado: string;
  descripcion: string;
  active: boolean;
  usuarioId: string;
};

type Cotizacion = {
  id: string;
  mineral: string;
  cotizacion: number;
  unidad: string;
  fecha: string;
  active: boolean;
  usuarioId: string;
};

// Signals
const comunicados = signal<Comunicado[]>([]);
const cotizaciones = signal<Cotizacion[]>([]);

// Mineral units
const mineralUnits = [
  "O.T.", // Onza Troy
  "L.F.", // Libra Fina
  "K.F.", // Kilogramo Fino
  "T.M.F.", // Tonelada Métrica Fina
  "T.C.S.", // Tonelada Corta Seca
  "T.L.S.", // Tonelada Larga Seca
  "T.M.S.", // Tonelada Métrica Seca
];

// Styles
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  title: {
    color: '#333',
    fontSize: '24px',
    marginBottom: '20px',
    textTransform: 'uppercase' as const,
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
    textTransform: 'uppercase' as const,
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
    textTransform: 'uppercase' as const,
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
    textTransform: 'uppercase' as const,
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #ddd',
    verticalAlign: 'top' as const,
    textTransform: 'uppercase' as const,
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
    textTransform: 'uppercase' as const,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
};

// Components
const ComunicadoForm: FunctionComponent<{
  onSubmit: (data: Omit<Comunicado, 'id' | 'active' | 'usuarioId'>) => void,
  initialData?: Comunicado,
  onCancel: () => void
}> = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Comunicado, 'id' | 'active' | 'usuarioId'>>(
    initialData || { comunicado: '', descripcion: '' }
  );

  useEffect(() => {
    if (initialData) {
      setFormData({ comunicado: initialData.comunicado.toUpperCase(), descripcion: initialData.descripcion.toUpperCase() });
    } else {
      setFormData({ comunicado: '', descripcion: '' });
    }
  }, [initialData]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit({
      comunicado: formData.comunicado.toUpperCase(),
      descripcion: formData.descripcion.toUpperCase()
    });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={formData.comunicado}
        onChange={(e) => setFormData({ ...formData, comunicado: (e.target as HTMLInputElement).value.toUpperCase() })}
        placeholder="COMUNICADO"
        required
        style={styles.input}
      />
      <input
        type="text"
        value={formData.descripcion}
        onChange={(e) => setFormData({ ...formData, descripcion: (e.target as HTMLInputElement).value.toUpperCase() })}
        placeholder="DESCRIPCIÓN"
        style={styles.input}
      />
      <button type="submit" style={styles.button}>{initialData ? 'ACTUALIZAR' : 'AÑADIR'} COMUNICADO</button>
      <button type="button" onClick={onCancel} style={{...styles.button, backgroundColor: '#f44336'}}>CANCELAR</button>
    </form>
  );
};

const CotizacionForm: FunctionComponent<{
  onSubmit: (data: Omit<Cotizacion, 'id' | 'active' | 'usuarioId' | 'fecha'>) => void,
  initialData?: Cotizacion,
  onCancel: () => void
}> = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Cotizacion, 'id' | 'active' | 'usuarioId' | 'fecha'>>(
    initialData || { mineral: '', cotizacion: 0, unidad: '' }
  );

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        mineral: initialData.mineral.toUpperCase(), 
        cotizacion: initialData.cotizacion, 
        unidad: initialData.unidad.toUpperCase() 
      });
    } else {
      setFormData({ mineral: '', cotizacion: 0, unidad: '' });
    }
  }, [initialData]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit({
      mineral: formData.mineral.toUpperCase(),
      cotizacion: parseFloat(formData.cotizacion.replace(',', '.')),
      unidad: formData.unidad.toUpperCase()
    });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={formData.mineral}
        onChange={(e) => setFormData({ ...formData, mineral: (e.target as HTMLInputElement).value.toUpperCase() })}
        placeholder="MINERAL"
        required
        style={styles.input}
      />
      <input
        type="text"
        value={formData.cotizacion}
        onChange={(e) => {
          const value = (e.target as HTMLInputElement).value;
          const numericValue = value.replace(',', '.');
          if (!isNaN(parseFloat(numericValue)) || value === '' || value === '-') {
            setFormData({ ...formData, cotizacion: value });
          }
        }}
        placeholder="COTIZACIÓN"
        required
        style={styles.input}
      />
      <select
        value={formData.unidad}
        onChange={(e) => setFormData({ ...formData, unidad: (e.target as HTMLSelectElement).value })}
        required
        style={styles.input}
      >
        <option value="">SELECCIONE UNIDAD</option>
        {mineralUnits.map((unit) => (
          <option key={unit} value={unit}>{unit}</option>
        ))}
      </select>
      <button type="submit" style={styles.button}>{initialData ? 'ACTUALIZAR' : 'AÑADIR'} COTIZACIÓN</button>
      <button type="button" onClick={onCancel} style={{...styles.button, backgroundColor: '#f44336'}}>CANCELAR</button>
    </form>
  );
};

const ConfirmationModal: FunctionComponent<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => (
  <div style={styles.modal}>
    <div style={styles.modalContent}>
      <p>{message.toUpperCase()}</p>
      <button onClick={onConfirm} style={{...styles.button, marginRight: '10px'}}>CONFIRMAR</button>
      <button onClick={onCancel} style={{...styles.button, backgroundColor: '#f44336'}}>CANCELAR</button>
    </div>
  </div>
);

// Main component
export function Cotizacion() {
  const [editingComunicado, setEditingComunicado] = useState<Comunicado | null>(null);
  const [editingCotizacion, setEditingCotizacion] = useState<Cotizacion | null>(null);
  const [deletingComunicado, setDeletingComunicado] = useState<Comunicado | null>(null);
  const [deletingCotizacion, setDeletingCotizacion] = useState<Cotizacion | null>(null);
  const { apiCall } = useAPI();

  useEffect(() => {
    fetchComunicados();
    fetchCotizaciones();
  }, []);

  const fetchComunicados = async () => {
    try {
      const response = await apiCall<Comunicado[]>('/ext/comunicados');
      comunicados.value = response;
    } catch (error) {
      console.error('Error fetching comunicados:', error);
    }
  };

  const fetchCotizaciones = async () => {
    try {
      const response = await apiCall<Cotizacion[]>('/ext/cotizaciones');
      cotizaciones.value = response;
    } catch (error) {
      console.error('Error fetching cotizaciones:', error);
    }
  };

  const handleSubmitComunicado = async (comunicado: Omit<Comunicado, 'id' | 'active' | 'usuarioId'>) => {
    try {
      if (editingComunicado) {
        await apiCall(`/ext/comunicados/${editingComunicado.id}`, 'PUT', { ...comunicado, id: editingComunicado.id });
      } else {
        await apiCall(`/ext/comunicados`, 'POST', { ...comunicado, usuarioId: 'user123' });
      }
      fetchComunicados();
      setEditingComunicado(null);
    } catch (error) {
      console.error('Error submitting comunicado:', error);
    }
  };

  const handleDeleteComunicado = async () => {
    if (deletingComunicado) {
      try {
        await apiCall(`/ext/comunicados/${deletingComunicado.id}`, 'DELETE');
        fetchComunicados();
        setDeletingComunicado(null);
      } catch (error) {
        console.error('Error deleting comunicado:', error);
      }
    }
  };

  const handleSubmitCotizacion = async (cotizacion: Omit<Cotizacion, 'id' | 'active' | 'usuarioId' | 'fecha'>) => {
    try {
      if (editingCotizacion) {
        await apiCall(`/ext/cotizaciones/${editingCotizacion.id}`, 'PUT', { ...cotizacion, id: editingCotizacion.id, fecha: editingCotizacion.fecha });
      } else {
        await apiCall(`/ext/cotizaciones`, 'POST', { ...cotizacion, usuarioId: 'user123' });
      }
      fetchCotizaciones();
      setEditingCotizacion(null);
    } catch (error) {
      console.error('Error submitting cotizacion:', error);
    }
  };

  const handleDeleteCotizacion = async () => {
    if (deletingCotizacion) {
      try {
        await apiCall(`/ext/cotizaciones/${deletingCotizacion.id}`, 'DELETE');
        fetchCotizaciones();
        setDeletingCotizacion(null);
      } catch (error) {
        console.error('Error deleting cotizacion:', error);
      }
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>COMUNICADOS Y COTIZACIONES</h1>

      <div>
        <h2 style={styles.title}>COMUNICADOS</h2>
        <ComunicadoForm 
          onSubmit={handleSubmitComunicado} 
          initialData={editingComunicado || undefined}
          onCancel={() => setEditingComunicado(null)}
        />
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>COMUNICADO</th>
              <th style={styles.th}>DESCRIPCIÓN</th>
              <th style={styles.th}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {comunicados.value.map((comunicado) => (
              <tr key={comunicado.id}>
                <td style={styles.td}>{comunicado.comunicado.toUpperCase()}</td>
                <td style={styles.td}>{comunicado.descripcion.toUpperCase()}</td>
                <td  style={styles.td}>
                  <button onClick={() => setEditingComunicado(comunicado)} style={styles.actionButton}>EDITAR</button>
                  <button onClick={() => setDeletingComunicado(comunicado)} style={{...styles.actionButton, ...styles.deleteButton}}>ELIMINAR</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 style={styles.title}>COTIZACIONES DE MINERALES</h2>
        <CotizacionForm 
          onSubmit={handleSubmitCotizacion} 
          initialData={editingCotizacion || undefined}
          onCancel={() => setEditingCotizacion(null)}
        />
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>MINERAL</th>
              <th style={styles.th}>COTIZACIÓN</th>
              <th style={styles.th}>UNIDAD</th>
              <th style={styles.th}>FECHA</th>
              <th style={styles.th}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {cotizaciones.value.map((cotizacion) => (
              <tr key={cotizacion.id}>
                <td style={styles.td}>{cotizacion.mineral.toUpperCase()}</td>
                <td style={styles.td}>{parseFloat(cotizacion.cotizacion.toString().replace(',', '.')).toFixed(2)}</td>
                <td style={styles.td}>{cotizacion.unidad.toUpperCase()}</td>
                <td style={styles.td}>{new Date(cotizacion.fecha).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <button onClick={() => setEditingCotizacion(cotizacion)} style={styles.actionButton}>EDITAR</button>
                  <button onClick={() => setDeletingCotizacion(cotizacion)} style={{...styles.actionButton, ...styles.deleteButton}}>ELIMINAR</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deletingComunicado && (
        <ConfirmationModal
          message={`¿ESTÁ SEGURO DE QUE DESEA ELIMINAR EL COMUNICADO "${deletingComunicado.comunicado.toUpperCase()}"?`}
          onConfirm={handleDeleteComunicado}
          onCancel={() => setDeletingComunicado(null)}
        />
      )}

      {deletingCotizacion && (
        <ConfirmationModal
          message={`¿ESTÁ SEGURO DE QUE DESEA ELIMINAR LA COTIZACIÓN DE "${deletingCotizacion.mineral.toUpperCase()}"?`}
          onConfirm={handleDeleteCotizacion}
          onCancel={() => setDeletingCotizacion(null)}
        />
      )}
    </div>
  );
}