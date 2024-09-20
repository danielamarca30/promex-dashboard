// import { useState, useEffect } from 'preact/hooks';
// import { css } from '@emotion/css';
// import { useAPI } from '../Context';
// import { User, LogOut, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

// // Types
// type EstadoFicha = 'Pendiente' | 'Llamado' | 'En_Atencion' | 'Atendido' | 'Cancelado' | 'No_Presentado';

// interface Ficha {
//   id: string;
//   codigo: string;
//   estado: EstadoFicha;
//   servicioId: string;
// }

// interface Empleado {
//   id: string;
//   nombres: string;
//   apellidos: string;
//   estado: 'Disponible' | 'Ocupado';
// }

// interface PuntoAtencion {
//   id: string;
//   nombre: string;
//   categoriaId: string;
//   empleadoId: string | null;
// }

// type EstadoCola = {
//   actual: Ficha | null;
//   siguiente: Ficha | null;
//   enAtencion: Ficha | null;
//   estaAtendiendo: boolean;
// };

// // Styles
// const estilos = {
//   app: css`
//     font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//     max-width: 800px;
//     margin: 0 auto;
//     padding: 20px;
//     background-color: #f0f4f8;
//     border-radius: 10px;
//     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//   `,
//   header: css`
//     background-color: #3498db;
//     color: white;
//     padding: 15px;
//     margin-bottom: 20px;
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     border-radius: 8px;
//     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//   `,
//   content: css`
//     display: grid;
//     grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
//     gap: 20px;
//   `,
//   empleadoInfo: css`
//     background-color: #ffffff;
//     padding: 15px;
//     border-radius: 8px;
//     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
//     transition: all 0.3s ease;
//     &:hover {
//       transform: translateY(-2px);
//       box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//     }
//   `,
//   ficha: css`
//     background-color: #ffffff;
//     padding: 15px;
//     border-radius: 8px;
//     text-align: center;
//     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
//     transition: all 0.3s ease;
//     &:hover {
//       transform: translateY(-2px);
//       box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//     }
//   `,
//   fichaNumero: css`
//     font-size: 28px;
//     font-weight: bold;
//     color: #2c3e50;
//   `,
//   button: css`
//     background-color: #3498db;
//     color: white;
//     border: none;
//     padding: 10px 15px;
//     border-radius: 5px;
//     cursor: pointer;
//     transition: all 0.3s ease;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     gap: 8px;
//     &:hover {
//       background-color: #2980b9;
//     }
//     &:disabled {
//       background-color: #bdc3c7;
//       cursor: not-allowed;
//     }
//   `,
//   fichasPendientes: css`
//     background-color: #ffffff;
//     padding: 15px;
//     border-radius: 8px;
//     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
//   `,
//   fichasPendientesList: css`
//     list-style-type: none;
//     padding: 0;
//     margin: 0;
//     display: flex;
//     flex-wrap: wrap;
//     gap: 10px;
//   `,
//   fichaPendiente: css`
//     background-color: #ecf0f1;
//     padding: 5px 10px;
//     border-radius: 15px;
//     font-size: 14px;
//     color: #34495e;
//   `,
// };

// const FichaDisplay = ({ ficha, titulo }: { ficha: Ficha | null, titulo: string }) => (
//   <div className={estilos.ficha}>
//     <h3 className="text-lg font-semibold mb-2 text-gray-700">{titulo}</h3>
//     <p className={estilos.fichaNumero}>{ficha ? ficha.codigo : '-'}</p>
//   </div>
// );

// const EmpleadoInfo = ({ empleado, puntoAtencion }: { empleado: Empleado | null, puntoAtencion: PuntoAtencion | null }) => (
//   <div className={estilos.empleadoInfo}>
//     <h3 className="text-lg font-semibold mb-2 text-gray-700">Información del Empleado</h3>
//     {empleado && puntoAtencion ? (
//       <>
//         <p className="text-gray-600"><User size={16} className="inline mr-2" /> {empleado.nombres} {empleado.apellidos}</p>
//         <p className="text-gray-600 mt-1"><Clock size={16} className="inline mr-2" /> {puntoAtencion.nombre}</p>
//         <p className="text-gray-600 mt-1">
//           {empleado.estado === 'Disponible' ? (
//             <CheckCircle size={16} className="inline mr-2 text-green-500" />
//           ) : (
//             <XCircle size={16} className="inline mr-2 text-red-500" />
//           )}
//           {empleado.estado}
//         </p>
//       </>
//     ) : (
//       <p className="text-gray-600">No hay información del empleado disponible</p>
//     )}
//   </div>
// );

// export function Caja({handleLogout}: {handleLogout: () => void}) {
//   const {apiCall, isAuthenticated} = useAPI();
//   const [empleado, setEmpleado] = useState<Empleado | null>(null);
//   const [puntoAtencion, setPuntoAtencion] = useState<PuntoAtencion | null>(null);
//   const [fichasPendientes, setFichasPendientes] = useState<Ficha[]>([]);
//   const [estadoCola, setEstadoCola] = useState<EstadoCola>({
//     actual: null,
//     siguiente: null,
//     enAtencion: null,
//     estaAtendiendo: false
//   });

//   useEffect(() => {
//     if (isAuthenticated) {
//       setEmpleado(JSON.parse(localStorage.getItem('empleado') || '{}') as Empleado);
//       setPuntoAtencion(JSON.parse(localStorage.getItem('puntoAtencion') || '{}') as PuntoAtencion);
//       obtenerProximaFicha();
//       obtenerFichasPendientes();
//     }
//   }, [isAuthenticated]);

//   const obtenerProximaFicha = async () => {
//     if (!puntoAtencion) return;
//     try {
//       const response: Ficha | null | any = await apiCall<Ficha | null>(`/api/proxima-ficha/${puntoAtencion.id}`);
//       setEstadoCola(prevEstado => ({
//         ...prevEstado,
//         siguiente: response.error ? null : response
//       }));
//     } catch (error) {
//       console.error('Failed to fetch next ticket:', error);
//     }
//   };

//   const obtenerFichasPendientes = async () => {
//     try {
//       const fichas = await apiCall<Ficha[]>(`/api/fichas-pendientes/`);
//       setFichasPendientes(fichas);
//     } catch (error) {
//       console.error('Failed to fetch pending tickets:', error);
//     }
//   };

//   const atenderFicha = async () => {
//     if (!empleado || !puntoAtencion || !estadoCola.siguiente || estadoCola.estaAtendiendo) return;
//     try {
//       await apiCall('/api/atender-ficha', 'POST', {
//         fichaId: estadoCola.siguiente.id,
//         empleadoId: empleado.id,
//         puntoAtencionId: puntoAtencion.id
//       });
//       setEstadoCola(prevEstado => ({
//         ...prevEstado,
//         enAtencion: prevEstado.siguiente,
//         actual: prevEstado.siguiente,
//         siguiente: null,
//         estaAtendiendo: true
//       }));
//       obtenerProximaFicha();
//     } catch (error) {
//       console.error('Failed to attend ticket:', error);
//     }
//   };

//   const finalizarAtencion = async () => {
//     if (!estadoCola.enAtencion) return;
//     try {
//       await apiCall('/api/finalizar-atencion', 'POST', { 
//         fichaId: estadoCola.enAtencion.id,
//         resultado: "exitoso" 
//       });
//       setEstadoCola(prevEstado => ({
//         ...prevEstado,
//         enAtencion: null,
//         actual: null,
//         estaAtendiendo: false
//       }));
//       obtenerProximaFicha();
//       obtenerFichasPendientes();
//     } catch (error) {
//       console.error('Failed to finish attention:', error);
//     }
//   };

//   return (
//     <div className={estilos.app}>
//       <header className={estilos.header}>
//         <h1 className="text-2xl font-bold">Sistema de Gestión de Cola</h1>
//         <button onClick={handleLogout} className={estilos.button}>
//           <LogOut size={18} />
//           Cerrar Sesión
//         </button>
//       </header>
//       <div className={estilos.content}>
//         <EmpleadoInfo empleado={empleado} puntoAtencion={puntoAtencion} />
//         <div className={estilos.fichasPendientes}>
//           <h3 className="text-lg font-semibold mb-2 text-gray-700">Fichas Pendientes</h3>
//           <ul className={estilos.fichasPendientesList}>
//             {fichasPendientes.map((ficha) => (
//               <li key={ficha.id} className={estilos.fichaPendiente}>{ficha.codigo}</li>
//             ))}
//           </ul>
//         </div>
//         <FichaDisplay ficha={estadoCola.enAtencion} titulo="Ficha en Atención" />
//         <FichaDisplay ficha={estadoCola.siguiente} titulo="Próxima Ficha" />
//         <button
//           onClick={atenderFicha}
//           disabled={estadoCola.estaAtendiendo || !estadoCola.siguiente}
//           className={estilos.button}
//         >
//           <User size={18} />
//           Atender Siguiente
//         </button>
//         <button
//           onClick={finalizarAtencion}
//           disabled={!estadoCola.estaAtendiendo}
//           className={estilos.button}
//         >
//           <CheckCircle size={18} />
//           Finalizar Atención
//         </button>
//         <button 
//           onClick={obtenerProximaFicha} 
//           disabled={estadoCola.estaAtendiendo}
//           className={estilos.button}
//         >
//           <RefreshCw size={18} />
//           Actualizar Próxima Ficha
//         </button>
//       </div>
//     </div>
//   );
// }




import { useState, useEffect } from 'preact/hooks';
import { css } from '@emotion/css';
import { useAPI } from '../Context';
import { User, LogOut, Clock, CheckCircle, XCircle, RefreshCw, PhoneCall, UserX } from 'lucide-react';

// Types
type EstadoFicha = 'Pendiente' | 'Llamado' | 'En_Atencion' | 'Atendido' | 'Cancelado' | 'No_Presentado';

interface Ficha {
  id: string;
  codigo: string;
  estado: EstadoFicha;
  servicioId: string;
}

interface Empleado {
  id: string;
  nombres: string;
  apellidos: string;
  estado: 'Disponible' | 'Ocupado';
}

interface PuntoAtencion {
  id: string;
  nombre: string;
  categoriaId: string;
  empleadoId: string | null;
}

type EstadoCola = {
  actual: Ficha | null;
  siguiente: Ficha | null;
  enAtencion: Ficha | null;
  estaAtendiendo: boolean;
  llamadasRealizadas: number;
};

// Styles
const estilos = {
  app: css`
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f0f4f8;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `,
  header: css`
    background-color: #3498db;
    color: white;
    padding: 15px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  `,
  content: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  `,
  empleadoInfo: css`
    background-color: #ffffff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  `,
  ficha: css`
    background-color: #ffffff;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  `,
  fichaNumero: css`
    font-size: 28px;
    font-weight: bold;
    color: #2c3e50;
  `,
  button: css`
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    &:hover {
      background-color: #2980b9;
    }
    &:disabled {
      background-color: #bdc3c7;
      cursor: not-allowed;
    }
  `,
  fichasPendientes: css`
    background-color: #ffffff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  `,
  fichasPendientesList: css`
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  `,
  fichaPendiente: css`
    background-color: #ecf0f1;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 14px;
    color: #34495e;
  `,
};

const FichaDisplay = ({ ficha, titulo }: { ficha: Ficha | null, titulo: string }) => (
  <div className={estilos.ficha}>
    <h3 className="text-lg font-semibold mb-2 text-gray-700">{titulo}</h3>
    <p className={estilos.fichaNumero}>{ficha ? ficha.codigo : '-'}</p>
  </div>
);

const EmpleadoInfo = ({ empleado, puntoAtencion }: { empleado: Empleado | null, puntoAtencion: PuntoAtencion | null }) => (
  <div className={estilos.empleadoInfo}>
    <h3 className="text-lg font-semibold mb-2 text-gray-700">Información del Empleado</h3>
    {empleado && puntoAtencion ? (
      <>
        <p className="text-gray-600"><User size={16} className="inline mr-2" /> {empleado.nombres} {empleado.apellidos}</p>
        <p className="text-gray-600 mt-1"><Clock size={16} className="inline mr-2" /> {puntoAtencion.nombre}</p>
        <p className="text-gray-600 mt-1">
          {empleado.estado === 'Disponible' ? (
            <CheckCircle size={16} className="inline mr-2 text-green-500" />
          ) : (
            <XCircle size={16} className="inline mr-2 text-red-500" />
          )}
          {empleado.estado}
        </p>
      </>
    ) : (
      <p className="text-gray-600">No hay información del empleado disponible</p>
    )}
  </div>
);

export function Caja({handleLogout}: {handleLogout: () => void}) {
  const {apiCall, isAuthenticated} = useAPI();
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [puntoAtencion, setPuntoAtencion] = useState<PuntoAtencion | null>(null);
  const [fichasPendientes, setFichasPendientes] = useState<Ficha[]>([]);
  const [estadoCola, setEstadoCola] = useState<EstadoCola>({
    actual: null,
    siguiente: null,
    enAtencion: null,
    estaAtendiendo: false,
    llamadasRealizadas: 0
  });

  useEffect(() => {
    if (isAuthenticated) {
      setEmpleado(JSON.parse(localStorage.getItem('empleado') || '{}') as Empleado);
      setPuntoAtencion(JSON.parse(localStorage.getItem('puntoAtencion') || '{}') as PuntoAtencion);
      obtenerProximaFicha();
      obtenerFichasPendientes();
    }
  }, [isAuthenticated]);

  const obtenerProximaFicha = async () => {
    if (!puntoAtencion) return;
    try {
      const response: Ficha | null | any = await apiCall<Ficha | null>(`/api/proxima-ficha/${puntoAtencion.id}`);
      setEstadoCola(prevEstado => ({
        ...prevEstado,
        siguiente: response.error ? null : response,
        llamadasRealizadas: 0
      }));
    } catch (error) {
      console.error('Failed to fetch next ticket:', error);
    }
  };

  const obtenerFichasPendientes = async () => {
    try {
      const fichas = await apiCall<Ficha[]>(`/api/fichas-pendientes/`);
      setFichasPendientes(fichas);
    } catch (error) {
      console.error('Failed to fetch pending tickets:', error);
    }
  };

  const llamarFicha = async () => {
    if (!estadoCola.siguiente || !puntoAtencion) return;
    try {
      const response = await apiCall(`/api/llamar-ficha/${estadoCola.siguiente.id}`, 'POST', {
        puntoAtencionId: puntoAtencion.id
      });
      setEstadoCola(prevEstado => ({
        ...prevEstado,
        actual: response.ficha,
        siguiente: null,
        llamadasRealizadas: prevEstado.llamadasRealizadas + 1
      }));
      if (estadoCola.llamadasRealizadas + 1 >= 3) {
        await marcarNoPresente();
      } else {
        obtenerProximaFicha();
      }
    } catch (error) {
      console.error('Failed to call ticket:', error);
    }
  };
  const marcarNoPresente = async () => {
    if (!estadoCola.actual) return;
    try {
      await apiCall(`/api/cancelar-ficha/${estadoCola.actual.id}`, 'POST');
      setEstadoCola(prevEstado => ({
        ...prevEstado,
        actual: null,
        estaAtendiendo: false,
        llamadasRealizadas: 0
      }));
      obtenerProximaFicha();
      obtenerFichasPendientes();
    } catch (error) {
      console.error('Failed to mark ticket as not present:', error);
    }
  };

  const atenderFicha = async () => {
    if (!empleado || !puntoAtencion || !estadoCola.actual || estadoCola.estaAtendiendo) return;
    try {
      await apiCall('/api/atender-ficha', 'POST', {
        fichaId: estadoCola.actual.id,
        empleadoId: empleado.id,
        puntoAtencionId: puntoAtencion.id
      });
      setEstadoCola(prevEstado => ({
        ...prevEstado,
        enAtencion: prevEstado.actual,
        actual: null,
        estaAtendiendo: true,
        llamadasRealizadas: 0
      }));
      obtenerProximaFicha();
    } catch (error) {
      console.error('Failed to attend ticket:', error);
    }
  };

  const finalizarAtencion = async () => {
    if (!estadoCola.enAtencion) return;
    try {
      await apiCall('/api/finalizar-atencion', 'POST', { 
        fichaId: estadoCola.enAtencion.id,
        resultado: "exitoso" 
      });
      setEstadoCola(prevEstado => ({
        ...prevEstado,
        enAtencion: null,
        estaAtendiendo: false,
        llamadasRealizadas: 0
      }));
      obtenerProximaFicha();
      obtenerFichasPendientes();
    } catch (error) {
      console.error('Failed to finish attention:', error);
    }
  };

  return (
    <div className={estilos.app}>
      <header className={estilos.header}>
        <h1 className="text-2xl font-bold">Sistema de Gestión de Cola</h1>
        <button onClick={handleLogout} className={estilos.button}>
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </header>
      <div className={estilos.content}>
        <EmpleadoInfo empleado={empleado} puntoAtencion={puntoAtencion} />
        <div className={estilos.fichasPendientes}>
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Fichas Pendientes</h3>
          <ul className={estilos.fichasPendientesList}>
            {fichasPendientes.map((ficha) => (
              <li key={ficha.id} className={estilos.fichaPendiente}>{ficha.codigo}</li>
            ))}
          </ul>
        </div>
        <FichaDisplay ficha={estadoCola.actual} titulo="Ficha Actual" />
        <FichaDisplay ficha={estadoCola.siguiente} titulo="Próxima Ficha" />
        <FichaDisplay ficha={estadoCola.enAtencion} titulo="Ficha en Atención" />
        <button
          onClick={llamarFicha}
          disabled={!estadoCola.siguiente || estadoCola.estaAtendiendo || (estadoCola.actual && estadoCola.llamadasRealizadas >= 3)}
          className={estilos.button}
        >
          <PhoneCall size={18} />
          Llamar Ficha ({estadoCola.llamadasRealizadas}/3)
        </button>
        <button
          onClick={marcarNoPresente}
          disabled={!estadoCola.actual || estadoCola.estaAtendiendo}
          className={estilos.button}
        >
          <UserX size={18} />
          No se Presentó
        </button>
        <button
          onClick={atenderFicha}
          disabled={!estadoCola.actual || estadoCola.estaAtendiendo}
          className={estilos.button}
        >
          <User size={18} />
          Atender Ficha
        </button>
        <button
          onClick={finalizarAtencion}
          disabled={!estadoCola.estaAtendiendo}
          className={estilos.button}
        >
          <CheckCircle size={18} />
          Finalizar Atención
        </button>
        <button 
          onClick={obtenerProximaFicha} 
          disabled={estadoCola.estaAtendiendo}
          className={estilos.button}
        >
          <RefreshCw size={18} />
          Actualizar Próxima Ficha
        </button>
      </div>
    </div>
  );
}