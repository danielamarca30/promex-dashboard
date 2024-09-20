import { useState, useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';
import axios from 'axios';

interface Comunicado {
  id: string;
  comunicado: string;
  descripcion: string;
  active: boolean;
  usuarioId: string;
}

interface Cotizacion {
  id: string;
  mineral: string;
  cotizacion: number;
  unidad: string;
  fecha: string;
  active: boolean;
  usuarioId: string;
}

const comunicados = signal<Comunicado[]>([]);
const cotizaciones = signal<Cotizacion[]>([]);

export function Cotizacion() {
  const [comunicadoForm, setComunicadoForm] = useState({ comunicado: '', descripcion: '' });
  const [cotizacionForm, setCotizacionForm] = useState({ mineral: '', cotizacion: 0, unidad: '' });
  const [editingComunicado, setEditingComunicado] = useState<string | null>(null);
  const [editingCotizacion, setEditingCotizacion] = useState<string | null>(null);

  useEffect(() => {
    fetchComunicados();
    fetchCotizaciones();
  }, []);

  const fetchComunicados = async () => {
    try {
      const response = await axios.get('http://localhost:3000/ext/comunicados');
      comunicados.value = response.data;
    } catch (error) {
      console.error('Error fetching comunicados:', error);
    }
  };

  const fetchCotizaciones = async () => {
    try {
      const response = await axios.get('http://localhost:3000/ext/cotizaciones');
      cotizaciones.value = response.data;
    } catch (error) {
      console.error('Error fetching cotizaciones:', error);
    }
  };

  const handleComunicadoSubmit = async (e: Event) => {
    e.preventDefault();
    try {
      if (editingComunicado) {
        await axios.put(`http://localhost:3000/ext/comunicados/${editingComunicado}`, comunicadoForm);
      } else {
        await axios.post('http://localhost:3000/ext/comunicados', { ...comunicadoForm, usuarioId: 'user123' });
      }
      setComunicadoForm({ comunicado: '', descripcion: '' });
      setEditingComunicado(null);
      fetchComunicados();
    } catch (error) {
      console.error('Error submitting comunicado:', error);
    }
  };

  const handleCotizacionSubmit = async (e: Event) => {
    e.preventDefault();
    try {
      if (editingCotizacion) {
        await axios.put(`http://localhost:3000/ext/cotizaciones/${editingCotizacion}`, cotizacionForm);
      } else {
        await axios.post('http://localhost:3000/ext/cotizaciones', { ...cotizacionForm, usuarioId: 'user123' });
      }
      setCotizacionForm({ mineral: '', cotizacion: 0, unidad: '' });
      setEditingCotizacion(null);
      fetchCotizaciones();
    } catch (error) {
      console.error('Error submitting cotizacion:', error);
    }
  };

  const deleteComunicado = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/ext/comunicados/${id}`);
      fetchComunicados();
    } catch (error) {
      console.error('Error deleting comunicado:', error);
    }
  };

  const deleteCotizacion = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/ext/cotizaciones/${id}`);
      fetchCotizaciones();
    } catch (error) {
      console.error('Error deleting cotizacion:', error);
    }
  };

  const editComunicado = (comunicado: Comunicado) => {
    setComunicadoForm({ comunicado: comunicado.comunicado, descripcion: comunicado.descripcion });
    setEditingComunicado(comunicado.id);
  };

  const editCotizacion = (cotizacion: Cotizacion) => {
    setCotizacionForm({ mineral: cotizacion.mineral, cotizacion: cotizacion.cotizacion, unidad: cotizacion.unidad });
    setEditingCotizacion(cotizacion.id);
  };

  return (
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-4">Comunicados y Cotizaciones</h1>

      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Comunicados</h2>
        <form onSubmit={handleComunicadoSubmit} class="mb-4">
          <input
            type="text"
            placeholder="Comunicado"
            value={comunicadoForm.comunicado}
            onInput={(e) => setComunicadoForm({ ...comunicadoForm, comunicado: (e.target as HTMLInputElement).value })}
            class="w-full p-2 mb-2 border rounded"
          />
          <textarea
            placeholder="Descripción"
            value={comunicadoForm.descripcion}
            onInput={(e) => setComunicadoForm({ ...comunicadoForm, descripcion: (e.target as HTMLTextAreaElement).value })}
            class="w-full p-2 mb-2 border rounded"
          ></textarea>
          <button type="submit" class="bg-blue-500 text-white p-2 rounded">
            {editingComunicado ? 'Actualizar' : 'Crear'} Comunicado
          </button>
        </form>
        <ul>
          {comunicados.value.map((comunicado) => (
            <li key={comunicado.id} class="mb-2 p-2 border rounded">
              <h3 class="font-bold">{comunicado.comunicado}</h3>
              <p>{comunicado.descripcion}</p>
              <button onClick={() => editComunicado(comunicado)} class="mr-2 text-blue-500">Editar</button>
              <button onClick={() => deleteComunicado(comunicado.id)} class="text-red-500">Eliminar</button>
            </li>
          ))}
        </ul>
      </div>

      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Cotizaciones de Minerales</h2>
        <form onSubmit={handleCotizacionSubmit} class="mb-4">
          <input
            type="text"
            placeholder="Mineral"
            value={cotizacionForm.mineral}
            onInput={(e) => setCotizacionForm({ ...cotizacionForm, mineral: (e.target as HTMLInputElement).value })}
            class="w-full p-2 mb-2 border rounded"
          />
          <input
            type="number"
            placeholder="Cotización"
            value={cotizacionForm.cotizacion}
            onInput={(e) => setCotizacionForm({ ...cotizacionForm, cotizacion: parseFloat((e.target as HTMLInputElement).value) })}
            class="w-full p-2 mb-2 border rounded"
          />
          <input
            type="text"
            placeholder="Unidad"
            value={cotizacionForm.unidad}
            onInput={(e) => setCotizacionForm({ ...cotizacionForm, unidad: (e.target as HTMLInputElement).value })}
            class="w-full p-2 mb-2 border rounded"
          />
          <button type="submit" class="bg-green-500 text-white p-2 rounded">
            {editingCotizacion ? 'Actualizar' : 'Crear'} Cotización
          </button>
        </form>
        <ul>
          {cotizaciones.value.map((cotizacion) => (
            <li key={cotizacion.id} class="mb-2 p-2 border rounded">
              <h3 class="font-bold">{cotizacion.mineral}</h3>
              <p>Cotización: {cotizacion.cotizacion} {cotizacion.unidad}</p>
              <p>Fecha: {new Date(cotizacion.fecha).toLocaleDateString()}</p>
              <button onClick={() => editCotizacion(cotizacion)} class="mr-2 text-blue-500">Editar</button>
              <button onClick={() => deleteCotizacion(cotizacion.id)} class="text-red-500">Eliminar</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}