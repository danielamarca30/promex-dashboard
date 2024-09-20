import { createContext, ComponentChildren } from 'preact';
import { useState, useContext, useCallback } from 'preact/hooks';

interface APIContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<LoginResponse>;
  logout: () => void;
  apiCall: <T>(endpoint: string, method?: string, data?: unknown, params?: Record<string, string>) => Promise<T>;
}

interface Credentials {
  username: string;
  password: string;
  categoriaServicio?:string;
}
interface Empleado{
    id:string;
    nombres:string;
    apellidos:string;
    estado:string;
}
interface LoginResponse {
  token: string;
  empleado:Empleado;
  puntoAtencion?:string;
  permisos?:string;
}

interface RefreshTokenResponse {
  newToken: string;
}

const APIContext = createContext<APIContextType | null>(null);

const BASE_URL = 'http://localhost:3000';

export function APIProvider({ children }: { children: ComponentChildren }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const refreshToken = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) throw new Error('Failed to refresh token');
      const data: RefreshTokenResponse = await response.json();
      setToken(data.newToken);
      localStorage.setItem('token', data.newToken);
      return data.newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('empleado');
      localStorage.removeItem('categoriaServicio');
      throw error;
    }
  }, [token]);

  const apiCall = useCallback(async <T,>(
    endpoint: string,
    method: string = 'GET',
    data: unknown = null,
    params: Record<string, string> | null = null
  ): Promise<T> => {
    let url = `${BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: data ? JSON.stringify(data) : undefined
    };

    try {
      let response = await fetch(url, options);

      if (response.status === 401) {
        // Token expired, try to refresh
        const newToken = await refreshToken();
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`
        };
        response = await fetch(url, options);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (method === 'DELETE' && response.status === 204) {
        return {} as T; // Para respuestas exitosas sin contenido en operaciones DELETE
      }
      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }, [token, refreshToken]);

  const login = useCallback(async (credentials: Credentials): Promise<LoginResponse> => {
    const data = await apiCall<LoginResponse>('/auth/login', 'POST', credentials);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('empleado', JSON.stringify(data.empleado));
    return data;
  }, [apiCall]);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('empleado');
    localStorage.removeItem('puntoAtencion');
    localStorage.removeItem('permisos');
  }, []);

  const contextValue: APIContextType = {
    token,
    isAuthenticated: !!token,
    login,
    logout,
    apiCall
  };

  return (
    <APIContext.Provider value={contextValue}>
      {children}
    </APIContext.Provider>
  );
}

export function useAPI(): APIContextType {
  const context = useContext(APIContext);
  if (context === null) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return context;
}