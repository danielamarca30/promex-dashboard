import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useAPI } from '../Context';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
  apellidos: string;
  estado: string;
};

type Categoria = {
  id: string;
  nombre: string;
  descripcion: string;
};

type FormData = {
  fechaInicio: string;
  fechaFin: string;
  empleadoId: string;
  categoria: string;
  items: string[];
};

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
    marginBottom: '20px',
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
  formRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  input: {
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    flex: '1',
  },
  select: {
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    flex: '1',
  },
  checkboxContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px',
  },
  checkbox: {
    marginRight: '8px',
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
  chart: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
  loading: {
    color: '#666',
    marginBottom: '10px',
  },
};

// Mapeo de nombres de columnas
const columnNames: { [key: string]: string } = {
  empleadoId: "ID del Empleado",
  empleadoNombre: "Nombre del Empleado",
  categoriaServicio: "Categoría de Servicio",
  cantidadAtendidos: "Cantidad Atendidos",
  tiempoPromedioAtencion: "Tiempo Promedio de Atención (minutos)",
  tiempoPromedioEspera: "Tiempo Promedio de Espera (minutos)"
};

// Función para convertir segundos a minutos
const secondsToMinutes = (seconds: number): number => seconds / 60;

// Components
const ReportForm = ({ 
  onSubmit, 
  empleados, 
  categorias 
}: { 
  onSubmit: (data: FormData) => void, 
  empleados: Empleado[], 
  categorias: Categoria[] 
}) => {
  const [formData, setFormData] = useState<FormData>({
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
      <div style={styles.formRow}>
        <input
          type="date"
          value={formData.fechaInicio}
          onInput={(e) => setFormData({ ...formData, fechaInicio: (e.target as HTMLInputElement).value })}
          placeholder="Fecha Inicio"
          required
          style={styles.input}
        />
        <input
          type="date"
          value={formData.fechaFin}
          onInput={(e) => setFormData({ ...formData, fechaFin: (e.target as HTMLInputElement).value })}
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
            <option key={empleado.id} value={empleado.id}>{`${empleado.nombres} ${empleado.apellidos}`}</option>
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
      </div>
      <div style={styles.checkboxContainer}>
        {Object.keys(columnNames).map((key) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={formData.items.includes(key)}
              onChange={() => handleItemChange(key)}
              style={styles.checkbox}
            />
            {columnNames[key]}
          </label>
        ))}
      </div>
      <button type="submit" style={styles.button}>Generar Reporte</button>
    </form>
  );
};

const PerformanceChart = ({ data, selectedItems }: { data: ReportItem[], selectedItems: string[] }) => {
  const chartData: ChartData<"bar"> = {
    labels: data.map(item => item.empleadoNombre),
    datasets: [
      ...(selectedItems.includes('cantidadAtendidos') ? [{
        label: 'Cantidad Atendidos',
        data: data.map(item => item.cantidadAtendidos),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }] : []),
      ...(selectedItems.includes('tiempoPromedioAtencion') ? [{
        label: 'Tiempo Promedio de Atención (min)',
        data: data.map(item => secondsToMinutes(item.tiempoPromedioAtencion)),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      }] : []),
      ...(selectedItems.includes('tiempoPromedioEspera') ? [{
        label: 'Tiempo Promedio de Espera (min)',
        data: data.map(item => secondsToMinutes(item.tiempoPromedioEspera)),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
      }] : [])
    ]
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Rendimiento de Empleados'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

// Main App Component
export function Reporte() {
  const { apiCall, isAuthenticated, login } = useAPI();
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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
      setError('Error al cargar empleados. Por favor, intente de nuevo.');
    }
  };

  const fetchCategorias = async () => {
    try {
      const data = await apiCall<Categoria[]>('/api/categorias');
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
      setError('Error al cargar categorías. Por favor, intente de nuevo.');
    }
  };

  const handleGenerateReport = async (formData: FormData) => {
    setLoading(true);
    setError(null);
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
      setSelectedItems(formData.items);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Error al generar el reporte. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const formattedData = reportData.map(item => {
      const rowData: { [key: string]: string | number } = {};
      selectedItems.forEach(key => {
        if (key.includes('tiempoPromedio')) {
          rowData[columnNames[key]] = secondsToMinutes(item[key as keyof ReportItem] as number).toFixed(2);
        } else {
          rowData[columnNames[key]] = item[key as keyof ReportItem];
        }
      });
      return rowData;
    });
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "reporte_detallado.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Reporte Detallado', 14, 22);
    doc.setFontSize(12);
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 30);
    
    const formattedData = reportData.map(item => {
      const rowData: (string | number)[] = [];
      selectedItems.forEach(key => {
        if (key.includes('tiempoPromedio')) {
          rowData.push(secondsToMinutes(item[key as keyof ReportItem] as number).toFixed(2));
        } else {
          rowData.push(item[key as keyof ReportItem]);
        }
      });
      return rowData;
    });

    doc.autoTable({
      head: [selectedItems.map(key => columnNames[key])],
      body: formattedData,
      startY: 40,
    });
    
    doc.save("reporte_detallado.pdf");
  };

  const handleLogin = async () => {
    try {
      await login({ username: 'testuser', password: 'testpassword' });
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Error al iniciar sesión. Por favor, intente de nuevo.');
    }
  };

  if (!isAuthenticated) {
    return (
      
      <div style={styles.container}>
        <h1 style={styles.title}>Por favor, inicie sesión para generar reportes</h1>
        <button onClick={handleLogin} style={styles.button}>Iniciar Sesión</button>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Generar Reporte Detallado</h2>
      <ReportForm onSubmit={handleGenerateReport} empleados={empleados} categorias={categorias} />
      {loading && <p style={styles.loading}>Cargando reporte...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {reportData.length > 0 && (
        <div>
          <h2 style={styles.title}>Resultados del Reporte</h2>
          <button onClick={exportToExcel} style={styles.button}>Exportar a Excel</button>
          <button onClick={exportToPDF} style={styles.button}>Exportar a PDF</button>
          <table style={styles.table}>
            <thead>
              <tr>
                {selectedItems.map((key) => (
                  <th key={key} style={styles.th}>{columnNames[key]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  {selectedItems.map((key) => (
                    <td key={key} style={styles.td}>
                      {key.includes('tiempoPromedio') 
                        ? `${secondsToMinutes(item[key as keyof ReportItem] as number).toFixed(2)} minutos` 
                        : item[key as keyof ReportItem]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={styles.chart}>
            <PerformanceChart data={reportData} selectedItems={selectedItems} />
          </div>
        </div>
      )}
    </div>
  );
}