import { useState, useEffect } from 'preact/hooks';
import { Servicios } from './componentes/Servicios';
import { Empleado } from './componentes/Empleados';
import { Reporte } from './componentes/Reportes';
import { Fichas } from './componentes/Fichas';
import { Cotizacion } from './componentes/Cotizaciones';
import { Videos } from './componentes/Videos';
import { Caja } from './componentes/Caja';
import { APIProvider } from './Context';
import {LoginView} from './componentes/Login';
import { useAPI } from './Context';

// Constants
type ViewType = 'login' | 'dashboard' | 'caja';
type DashboardViewType = 'servicios y categorias' | 'empleados' | 'cotizacion' |'videos'|'reportes'|'fichas';
interface DashboardViewProps {
  dashboardView: DashboardViewType;
  setDashboardView: (view: DashboardViewType) => void;
  handleLogout: () => void;
  fichas: any[];
  categorias: any[];
  puntosAtencion: any[];
}
interface HomeViewProps {
  fichas: any[];
  categorias: any[];
  puntosAtencion: any[];
}


type Ficha = {
  id: string;
  codigo: string;
  estado: string;
  createdAt: string;
  servicio: string;
  categoria: string;
};

type Categoria = {
  id: string;
  nombre: string;
};

type PuntoAtencion = {
  id: string;
  nombre: string;
  categoriaId: string;
};

type Empleado = {
  id: string;
  nombres: string;
  apellidos: string;
  estado: 'Disponible' | 'Ocupado';
};


// Actualización de estilos
const styles = `
  html{
  marign:0;
  padding:0;
  }
  .app-container { min-height: 100vh; width:100vw; background-color: #f3f4f6; }
  
  .login-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem; }
  .login-form { max-width: 400px; width: 100%; background-color: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
  .login-title { font-size: 1.5rem; font-weight: 700; text-align: center; margin-bottom: 2rem; }
  .login-input { width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid #d1d5db; border-radius: 0.25rem; }
  .login-button { width: 100%; padding: 0.5rem; background-color: #4f46e5; color: white; border: none; border-radius: 0.25rem; cursor: pointer; }
  
  .dashboard-container { display: flex; min-height: 100vh; }
  .dashboard-sidebar { width: 200px; background-color: #1f2937; color: white; padding: 1rem; }
  .dashboard-logo { font-size: 1.25rem; font-weight: 600; margin-bottom: 2rem; }
  .dashboard-nav { display: flex; flex-direction: column; gap: 0.5rem; }
  .dashboard-nav-button { background: none; border: none; color: #d1d5db; text-align: left; padding: 0.5rem; cursor: pointer; transition: background-color 0.3s; }
  .dashboard-nav-button:hover { background-color: #374151; }
  .dashboard-nav-button.active { background-color: #374151; color: white; }
  .dashboard-main { flex-grow: 1; padding: 5px; }
  .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
  .dashboard-title { font-size: 1.5rem; font-weight: 700; }
  
  .view-container { background-color: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
  .view-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }
  .view-form { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
  .view-input { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem; }
  .view-button { padding: 0.5rem 1rem; background-color: #4f46e5; color: white; border: none; border-radius: 0.25rem; cursor: pointer; }
  .view-list { list-style-type: none; padding: 0; }
  .view-list-item { padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb; }
  
  .chart-container { height: 400px; margin-top: 2rem; }
`;
const DashboardView = ({ dashboardView, setDashboardView, handleLogout, fichas, categorias, puntosAtencion }
  :DashboardViewProps) => (
  <div className="dashboard-container">
    <aside className="dashboard-sidebar">
      <div className="dashboard-logo">Gestión de Colas</div>
      <nav className="dashboard-nav">
        {['reportes','fichas','servicios y categorias','empleados','cotizacion','videos'].map((view) => (
          <button
            key={view}
            onClick={() => setDashboardView(view as DashboardViewType)}
            className={`dashboard-nav-button ${dashboardView === view ? 'active' : ''}`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </nav>
      <button onClick={handleLogout} className="dashboard-nav-button" style={{marginTop: 'auto'}}>
        Cerrar sesión
      </button>
    </aside>
    <main className="dashboard-main">
      {/* <header className="dashboard-header">
        <h1 className="dashboard-title">
          {dashboardView === 'home' && 'Resumen'}
          {dashboardView === 'fichas' && 'Fichas'}
          {dashboardView === 'servicios' && 'Gestión de Servicios'}
          {dashboardView === 'categorias' && 'Gestión de Categorías'}
          {dashboardView === 'puntosAtencion' && 'Gestión de Puntos de Atención'}
          {dashboardView === 'empleados' && 'Gestión de Empleados'}
          {dashboardView === 'cotizacion' && 'Gestión de Cotizacion y comunicados'}
          {dashboardView === 'videos' && 'Gestión de Videos'}
          {dashboardView === 'reportes' && 'Reportes'}
        </h1>
        </header> */}
        {dashboardView === 'reportes' && <Reporte />}
      {dashboardView === 'fichas' && <Fichas />}
      {dashboardView === 'servicios y categorias' && <Servicios />}
      {dashboardView === 'empleados' && <Empleado />}
      {dashboardView === 'cotizacion' && <Cotizacion />}
      {dashboardView === 'videos' && <Videos />}
    </main>
  </div>
);
// Main component
export function Main() {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<ViewType>(() => {
    const storedView = localStorage.getItem('currentView') as ViewType;
    return storedView || 'login';
  });
  const [dashboardView, setDashboardView] = useState<DashboardViewType>(() => {
    const storedDashboardView = localStorage.getItem('currentDashboardView') as DashboardViewType;
    return storedDashboardView || 'home';
  });
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [puntosAtencion, setPuntosAtencion] = useState<PuntoAtencion[]>([]);
  
  const { isAuthenticated, logout, apiCall } = useAPI();

  useEffect(() => {
    console.log('use effect',view,isAuthenticated);
    const checkAuthAndFetchData = async () => {
      if (isAuthenticated) {
        // if (view === 'login') {
        //   setView('dashboard');
        // }
        await fetchData();
      } else {
        setView('login');
      }
      setTimeout(()=>{
        setIsLoading(false);
      },200);
    };

    checkAuthAndFetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('currentView', view);
      if (view === 'dashboard') {
        localStorage.setItem('currentDashboardView', dashboardView);
      }
    }
  }, [view, dashboardView, isLoading]);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [fichasData, categoriasData, puntosAtencionData] = await Promise.all([
        apiCall<Ficha[]>('/api/ficha/recientes'),
        apiCall<Categoria[]>('/api/categorias'),
        apiCall<PuntoAtencion[]>('/api/puntos-atencion'),
      ]);
      setFichas(fichasData);
      setCategorias(categoriasData);
      setPuntosAtencion(puntosAtencionData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setView('login');
    localStorage.removeItem('currentView');
    localStorage.removeItem('currentDashboardView');
  };

  if (isLoading) {
    return (
      <div className="loginContainer">
        <div className="spinner"></div>
      </div>
    );
  }
  
  console.log('render app :',view);
  return (
    <div className="app-container">
      {view === 'login' ? (
        <LoginView setView={setView} />
      ) : view ==='dashboard'?(
        <DashboardView
          dashboardView={dashboardView}
          setDashboardView={setDashboardView}
          handleLogout={handleLogout}
          fichas={fichas}
          categorias={categorias}
          puntosAtencion={puntosAtencion}
        />
      ):(<Caja handleLogout={handleLogout}/>)}
    </div>
  );
}

export function App() {
  return (
    <APIProvider>
      <Main />
    </APIProvider>
  );
}