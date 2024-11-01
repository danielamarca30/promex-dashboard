import React, { useState, useEffect, useRef } from 'react'
import { useAPI } from '../Context'
import { css } from '@emotion/css'
import { User, LogOut, Clock, CheckCircle, XCircle, RefreshCw, PhoneCall, UserX } from 'lucide-react'

// Types
type EstadoFicha = 'Pendiente' | 'Llamado' | 'En_Atencion' | 'Atendido' | 'Cancelado' | 'No_Presentado'

interface Ficha {
  id: string
  codigo: string
  estado: EstadoFicha
  servicioId: string
  empleadoId:string;
  puntoAtencionId:string;
}

interface Empleado {
  id: string
  nombres: string
  apellidos: string
  estado: 'Disponible' | 'Ocupado'
}

interface PuntoAtencion {
  id: string
  nombre: string
  categoriaId: string
  empleadoId: string | null
}

interface EstadoCola {
  actual: Ficha | null
  siguiente: Ficha | null
  enAtencion: Ficha | null
  estaAtendiendo: boolean
  llamadasRealizadas: number
  estadoLlamada: 'idle' | 'llamando' | 'no_presente'
}

interface Categoria {
  id?: string
  nombre: string
  descripcion?: string
}

interface Subcategoria {
  id?: string
  nombre: string
  descripcion?: string
  categoriaId: string
}

interface Servicio {
  id?: string
  nombre: string
  prioridad: number
  descripcion?: string
  categoriaId: string
  subCategoriaId?: string
  tiempoEstimado: number
  activo: boolean
}

interface FichaDisplayProps {
  ficha: Ficha | null
  titulo: string
  servicio: Servicio | null
  categoria: Categoria | null
  subcategoria: Subcategoria | null
}

interface EmpleadoInfoProps {
  empleado: Empleado | null
  puntoAtencion: PuntoAtencion | null
}

interface CajaProps {
  handleLogout: () => void
}

const FichaDisplay: React.FC<FichaDisplayProps> = ({ ficha, titulo, servicio, categoria, subcategoria }) => (
  <div className={`${estilos.ficha} ${titulo === "Ficha en Atención" ? estilos.fichaEnAtencion : ""}`}>
    <h3 className="text-lg font-semibold mb-2 text-gray-700">{titulo}</h3>
    <p className={estilos.fichaNumero}>{ficha ? ficha.codigo : '-'}</p>
    {ficha && servicio && (
      <div className="mt-2 text-sm text-gray-600">
        {/* <p>Servicio: {servicio.nombre}</p> */}
        <p>Categoría: {categoria?.nombre}</p>
        {subcategoria && <p>Subcategoría: {subcategoria.nombre}</p>}
        {/* <p>Tiempo estimado: {servicio.tiempoEstimado} min</p> */}
      </div>
    )}
  </div>
)

const EmpleadoInfo: React.FC<EmpleadoInfoProps> = ({ empleado, puntoAtencion }) => (
  <div className={estilos.empleadoInfo}>
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
)

export const Caja: React.FC<CajaProps> = ({ handleLogout }) => {
  const { apiCall, isAuthenticated } = useAPI()
  const [empleado, setEmpleado] = useState<Empleado | null>(null)
  const [puntoAtencion, setPuntoAtencion] = useState<PuntoAtencion | null>(null)
  const [fichasPendientes, setFichasPendientes] = useState<Ficha[]>([])
  const [estadoCola, setEstadoCola] = useState<EstadoCola>({
    actual: null,
    siguiente: null,
    enAtencion: null,
    estaAtendiendo: false,
    llamadasRealizadas: 0,
    estadoLlamada: 'idle'
  })
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])

  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    const initializeData = async () => {
      if (isAuthenticated) {
        const storedEmpleado = JSON.parse(localStorage.getItem('empleado') || 'null')
        const storedPuntoAtencion = JSON.parse(localStorage.getItem('puntoAtencion') || 'null')
        
        if (storedEmpleado && storedPuntoAtencion) {
          setEmpleado(storedEmpleado)
          setPuntoAtencion(storedPuntoAtencion)
          
          // Verificar si hay un ticket en estado "llamando" para este punto de atención
          await verificarTicketLlamando(storedPuntoAtencion.id)
          
          await obtenerProximaFicha(storedPuntoAtencion.id)
          await obtenerFichasPendientes(storedPuntoAtencion.categoriaId)
          await obtenerCategorias()
          await obtenerSubcategorias()
          await obtenerServicios()

          intervalRef.current = window.setInterval(() => {
            obtenerProximaFicha(storedPuntoAtencion.id)
            obtenerFichasPendientes(storedPuntoAtencion.categoriaId)
          }, 5000)
        } else {
          console.error('No se encontró información del empleado o punto de atención en localStorage')
        }
      }
    }

    initializeData()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAuthenticated])

  const verificarTicketLlamando = async (puntoAtencionId: string) => {
    try {
      const response = await apiCall<Ficha[]>('/api/ficha/recientes')
      if (Array.isArray(response)) {
        const ticketLlamando = response.find(ficha => 
          ficha.estado === 'Llamado' && ficha.puntoAtencionId === puntoAtencionId
        )
        if (ticketLlamando) {
          setEstadoCola(prevEstado => ({
            ...prevEstado,
            actual: ticketLlamando,
            estadoLlamada: 'llamando'
          }))
        }
      }
    } catch (error) {
      console.error('Error al verificar ticket llamando:', error)
    }
  }

  const obtenerProximaFicha = async (puntoAtencionId: string) => {
    if (!puntoAtencionId) {
      console.error('No se proporcionó un ID de punto de atención válido')
      return
    }
    try {
      const response = await apiCall<Ficha | null>(`/api/ficha/proxima-ficha/${puntoAtencionId}`)
      if (response && !('error' in response)) {
        setEstadoCola(prevEstado => ({
          ...prevEstado,
          siguiente: response,
        }))
      } else {
        console.log('No hay próxima ficha disponible')
        setEstadoCola(prevEstado => ({
          ...prevEstado,
          siguiente: null,
        }))
      }
    } catch (error) {
      console.error('Error al obtener la próxima ficha:', error)
    }
  }

  const obtenerFichasPendientes = async (categoriaId: string) => {
    try {
      const url = `/api/ficha/fichas-pendientes/${categoriaId}`
      console.log('Obteniendo fichas pendientes:', url)
      const fichas = await apiCall<Ficha[]>(url)
      console.log('Fichas pendientes recibidas:', fichas)
      setFichasPendientes(fichas)
    } catch (error) {
      console.error('Error al obtener fichas pendientes:', error)
    }
  }

  const obtenerCategorias = async () => {
    try {
      const categoriasData = await apiCall<Categoria[]>('/api/categorias')
      setCategorias(categoriasData)
    } catch (error) {
      console.error('Error al obtener categorías:', error)
    }
  }

  const obtenerSubcategorias = async () => {
    try {
      const subcategoriasData = await apiCall<Subcategoria[]>('/api/subcategorias')
      setSubcategorias(subcategoriasData)
    } catch (error) {
      console.error('Error al obtener subcategorías:', error)
    }
  }

  const obtenerServicios = async () => {
    try {
      const serviciosData = await apiCall<Servicio[]>('/api/servicios')
      setServicios(serviciosData)
    } catch (error) {
      console.error('Error al obtener servicios:', error)
    }
  }

  const llamarFicha = async () => {
    if (!estadoCola.siguiente || !puntoAtencion) {
      console.error('No hay ficha siguiente o punto de atención definido')
      return
    }
    try {
      setEstadoCola(prevEstado => ({
        ...prevEstado,
        estadoLlamada: 'llamando'
      }))

      const response = await apiCall<{ ficha: Ficha }>(`/api/ficha/llamar-ficha/${estadoCola.siguiente.id}`, 'POST', {
        puntoAtencionId: puntoAtencion.id
      })
      console.log('llamar ficha', response)
      if (response && response.ficha) {
        setEstadoCola(prevEstado => ({
          ...prevEstado,
          actual: response.ficha,
          siguiente: null,
          llamadasRealizadas: prevEstado.llamadasRealizadas + 1,
          estadoLlamada: 'no_presente'
        }))

        await obtenerProximaFicha(puntoAtencion.id)
      } else {
        console.error('La respuesta de llamar ficha no contiene una ficha válida')
        setEstadoCola(prevEstado => ({
          ...prevEstado,
          estadoLlamada: 'idle'
        }))
      }
    } catch (error) {
      console.error('Error al llamar ficha:', error)
      setEstadoCola(prevEstado => ({
        ...prevEstado,
        estadoLlamada: 'idle'
      }))
    }
    
    if (puntoAtencion) {
      await obtenerFichasPendientes(puntoAtencion.categoriaId)
    }
  }

  const marcarNoPresente = async () => {
    if (!empleado || !puntoAtencion || !estadoCola.actual || estadoCola.estaAtendiendo) return
    try {
      await apiCall(`/api/ficha/cancelar/${estadoCola.actual.id}`, 'POST', {
        fichaId: estadoCola.actual.id,
        empleadoId: empleado.id,
        puntoAtencionId: puntoAtencion.id
      })
      setEstadoCola(prevEstado => ({
        ...prevEstado,
        actual: null,
        estaAtendiendo: false,
        llamadasRealizadas: 0,
        estadoLlamada: 'idle'
      }))
      if (puntoAtencion) {
        obtenerProximaFicha(puntoAtencion.id)
        obtenerFichasPendientes(puntoAtencion.categoriaId)
      }
    } catch (error) {
      console.error('Error al marcar ficha como no presente:', error)
    }
  }

  const atenderFicha = async () => {
    if (!empleado || !puntoAtencion || !estadoCola.actual || estadoCola.estaAtendiendo) return
    try {
      await apiCall('/api/ficha/atender-ficha', 'POST', {
        fichaId: estadoCola.actual.id,
        empleadoId: empleado.id,
        puntoAtencionId: puntoAtencion.id
      })
      setEstadoCola(prevEstado => ({
        ...prevEstado,
        enAtencion: prevEstado.actual,
        actual: null,
        estaAtendiendo: true,
        llamadasRealizadas: 0,
        estadoLlamada: 'idle'
      }))
      obtenerProximaFicha(puntoAtencion.id)
    } catch (error) {
      console.error('Error al atender ficha:', error)
    }
  }

  const finalizarAtencion = async () => {
    if (!estadoCola.enAtencion || !puntoAtencion) return
    try {
      await apiCall('/api/ficha/finalizar-atencion', 'POST', { 
        fichaId: estadoCola.enAtencion.id,
        resultado: "exitoso" 
      })
      setEstadoCola(prevEstado => ({
        ...prevEstado,
        enAtencion: null,
        estaAtendiendo: false,
        llamadasRealizadas: 0,
        estadoLlamada: 'idle'
      }))
      obtenerProximaFicha(puntoAtencion.id)
      obtenerFichasPendientes(puntoAtencion.categoriaId)
    } catch (error) {
      console.error('Error al finalizar atención:', error)
    }
  }

  const obtenerServicioInfo = (servicioId: string): { servicio: Servicio | null, categoria: Categoria | null, subcategoria: Subcategoria | null } => {
    const servicio = servicios.find(s => s.id === servicioId) || null
    if (!servicio) return { servicio: null, categoria: null, subcategoria: null }
    
    const categoria = categorias.find(c => c.id === servicio.categoriaId) || null
    const subcategoria = subcategorias.find(sc  => sc.id === servicio.subCategoriaId) || null
    
    return { servicio, categoria, subcategoria }
  }

  return (
    <div className={estilos.app}>
      <div className={estilos.sidebar}>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Fichas Pendientes</h3>
        <ul className={estilos.fichasPendientesList}>
          {[...Array(10)].map((_, index) => (
            <li key={index} className={estilos.fichaPendiente}>
              {fichasPendientes[index] ? fichasPendientes[index].codigo : '-'}
            </li>
          ))}
        </ul>
      
      </div>
      <div className={estilos.mainContent}>
        <header className={estilos.header}>
          <EmpleadoInfo empleado={empleado} puntoAtencion={puntoAtencion} />
          <button onClick={handleLogout} className={estilos.logoutButton}>
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </header>
        <div className={estilos.content}>
          <div className={estilos.fichasContainer}>
            <FichaDisplay 
              ficha={estadoCola.enAtencion} 
              titulo="Ficha en Atención"
              {...obtenerServicioInfo(estadoCola.enAtencion?.servicioId || '')}
            />
            <FichaDisplay 
              ficha={estadoCola.actual} 
              titulo="Ficha Actual" 
              {...obtenerServicioInfo(estadoCola.actual?.servicioId || '')}
            />
            <FichaDisplay 
              ficha={estadoCola.siguiente} 
              titulo="Próxima Ficha"
              {...obtenerServicioInfo(estadoCola.siguiente?.servicioId || '')}
            />
          </div>
          <div className={estilos.buttonContainer}>
            <button
              onClick={estadoCola.estadoLlamada === 'no_presente' ? marcarNoPresente : llamarFicha}
              disabled={!estadoCola.siguiente || estadoCola.estaAtendiendo || estadoCola.estadoLlamada === 'llamando'}
              className={`${estilos.button} ${estilos.buttonLlamar}`}
            >
              {estadoCola.estadoLlamada === 'llamando' ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Llamando...
                </>
              ) : estadoCola.estadoLlamada === 'no_presente' ? (
                <>
                  <UserX size={18} />
                  No se Presentó
                </>
              ) : (
                <>
                  <PhoneCall size={18} />
                  Llamar Ficha
                </>
              )}
            </button>
            <button
              onClick={atenderFicha}
              disabled={!estadoCola.actual || estadoCola.estaAtendiendo}
              className={`${estilos.button} ${estilos.buttonAtender}`}
            >
              <User size={18} />
              Atender Ficha
            </button>
            <button
              onClick={finalizarAtencion}
              disabled={!estadoCola.estaAtendiendo}
              className={`${estilos.button} ${estilos.buttonFinalizar}`}
            >
              <CheckCircle size={18} />
              Finalizar Atención
            </button>
            <button 
              onClick={() => puntoAtencion && obtenerProximaFicha(puntoAtencion.id)} 
              disabled={estadoCola.estaAtendiendo}
              className={estilos.buttonActualizar}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Updated Styles
const estilos = {
  app: css`
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    display: flex;
    max-width: 1200px;
    margin: 0 auto;
    background-color: #f0f4f8;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `,
  sidebar: css`
    width: 200px;
    padding: 20px;
    background-color: #ffffff;
    border-right: 1px solid #e0e0e0;
  `,
  mainContent: css`
    flex: 1;
    padding: 20px;
  `,
  header: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin-bottom: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  `,
  content: css`
    display: flex;
    flex-direction: column;
    gap: 20px;
  `,
  empleadoInfo: css`
    display: flex;
    gap: 20px;
    align-items: center;
  `,
  fichasContainer: css`
    display: flex;
    justify-content: space-between;
    gap: 20px;
  `,
  ficha: css`
    background-color: #ffffff;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    flex: 1;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  `,
  fichaEnAtencion: css`
    background-color: #e8f5e9;
    border: 2px solid #4caf50;
  `,
  fichaNumero: css`
    font-size: 28px;
    font-weight: bold;
    color: #2c3e50;
  `,
  buttonContainer: css`
    display: flex;
    justify-content: space-between;
    gap: 10px;
  `,
  button: css`
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
    flex: 1;
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
  buttonLlamar: css`
    background-color: #3498db;
    &:hover:not(:disabled) {
      background-color: #2980b9;
    }
  `,
  buttonAtender: css`
    background-color: #2ecc71;
    &:hover:not(:disabled) {
      background-color: #27ae60;
    }
  `,
  buttonFinalizar: css`
    background-color: #e74c3c;
    &:hover:not(:disabled) {
      background-color: #c0392b;
    }
  `,
  buttonActualizar: css`
    background-color: #95a5a6;
    padding: 10px;
    &:hover:not(:disabled) {
      background-color: #7f8c8d;
    }
  `,
  logoutButton: css`
    background-color: transparent;
    color: #34495e;
    border: 1px solid #34495e;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    &:hover {
      background-color: #34495e;
      color: white;
    }
  `,
  fichasPendientesList: css`
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `,
  fichaPendiente: css`
    background-color: #ecf0f1;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 14px;
    color: #34495e;
    text-align: center;
  `,
}