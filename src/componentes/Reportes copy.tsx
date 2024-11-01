import { useState, useEffect } from 'preact/hooks';
import { useAPI } from '../Context'; // Adjust the import path as needed
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Types
type ReportItem = {
  empleadoId: string;
  empleadoNombre: string;
  categoriaServicio: string;
  cantidadAtendidos: number;
  tiempoPromedioAtencion: number;
  tiempoPromedioEspera: number;
};

type Empleado = {
  id: string;
  nombres: string;
  apellidos:string;
  estado:string;
};

type Categoria = {
  id: string;
  nombre: string;
  descripcion:string;
};

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
  checkbox: {
    marginRight: '8px',
  },
};

// Components
const ReportForm = ({ onSubmit, empleados, categorias }: { 
  onSubmit: (data: any) => void, 
  empleados: Empleado[], 
  categorias: Categoria[] 
}) => {
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaFin: '',
    empleadoId: '',
    categoria: '',
    items: ['empleadoNombre', 'categoriaServicio', 'cantidadAtendidos', 'tiempoPromedioAtencion', 'tiempoPromedioEspera'],
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleItemChange = (item: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.includes(item)
        ? prev.items.filter(i => i !== item)
        : [...prev.items, item]
    }));
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="date"
        value={formData.fechaInicio}
        onChange={(e) => setFormData({ ...formData, fechaInicio: (e.target as HTMLInputElement).value })}
        placeholder="Fecha Inicio"
        required
        style={styles.input}
      />
      <input
        type="date"
        value={formData.fechaFin}
        onChange={(e) => setFormData({ ...formData, fechaFin: (e.target as HTMLInputElement).value })}
        placeholder="Fecha Fin"
        required
        style={styles.input}
      />
      <select
        value={formData.empleadoId}
        onChange={(e) => setFormData({ ...formData, empleadoId: (e.target as HTMLSelectElement).value })}
        style={styles.select}
      >
        <option value="">Todos los empleados</option>
        {empleados.map((empleado) => (
          <option key={empleado.id} value={empleado.id}>{empleado.nombres}{empleado.apellidos}</option>
        ))}
      </select>
      <select
        value={formData.categoria}
        onChange={(e) => setFormData({ ...formData, categoria: (e.target as HTMLSelectElement).value })}
        style={styles.select}
      >
        <option value="">Todas las categorías</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.nombre}>{categoria.nombre}</option>
        ))}
      </select>
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.items.includes('empleadoNombre')}
            onChange={() => handleItemChange('empleadoNombre')}
            style={styles.checkbox}
          />
          Nombre del Empleado
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.items.includes('categoriaServicio')}
            onChange={() => handleItemChange('categoriaServicio')}
            style={styles.checkbox}
          />
          Categoría de Servicio
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.items.includes('cantidadAtendidos')}
            onChange={() => handleItemChange('cantidadAtendidos')}
            style={styles.checkbox}
          />
          Cantidad Atendidos
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.items.includes('tiempoPromedioAtencion')}
            onChange={() => handleItemChange('tiempoPromedioAtencion')}
            style={styles.checkbox}
          />
          Tiempo Promedio de Atención
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.items.includes('tiempoPromedioEspera')}
            onChange={() => handleItemChange('tiempoPromedioEspera')}
            style={styles.checkbox}
          />
          Tiempo Promedio de Espera
        </label>
      </div>
      <button type="submit" style={styles.button}>Generar Reporte</button>
    </form>
  );
};

// Main App Component
export function Reporte() {
  const { apiCall, isAuthenticated, login } = useAPI();
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmpleados();
      fetchCategorias();
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

  const fetchCategorias = async () => {
    try {
      const data = await apiCall<Categoria[]>('/api/categorias');
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  const handleGenerateReport = async (formData: any) => {
    try {
      const queryParams = new URLSearchParams({
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        empleadoId: formData.empleadoId,
        categoria: formData.categoria,
        items: formData.items.join(','),
      });
      const data = await apiCall<ReportItem[]>(`/api/metricas/reportes-personalizados?${queryParams}`);
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "reporte.xlsx");
  };

  const exportToPDF = () => {
    const doc:any = new jsPDF();
    doc.autoTable({
      head: [Object.keys(reportData[0])],
      body: reportData.map(Object.values),
    });
    doc.save("reporte.pdf");
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
        <h1 style={styles.title}>Por favor, inicie sesión para generar reportes</h1>
        <button onClick={handleLogin} style={styles.button}>Iniciar Sesión</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Generar Reporte</h2>
      <ReportForm onSubmit={handleGenerateReport} empleados={empleados} categorias={categorias} />

      {reportData.length > 0 && (
        <div>
          <h2 style={styles.title}>Resultados del Reporte</h2>
          <button onClick={exportToExcel} style={styles.button}>Exportar a Excel</button>
          <button onClick={exportToPDF} style={styles.button}>Exportar a PDF</button>
          <table style={styles.table}>
            <thead>
              <tr>
                {Object.keys(reportData[0]).map((key) => (
                  <th key={key} style={styles.th}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  {Object.values(item).map((value, idx) => (
                    <td key={idx} style={styles.td}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}