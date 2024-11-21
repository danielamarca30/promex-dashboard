import { createContext, ComponentChildren } from 'preact';
import { useState, useContext, useCallback, useRef, useEffect } from 'preact/hooks';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

interface APIContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<LoginResponse>;
  logout: () => void;
  apiCall: <T>(endpoint: string, method?: string, data?: unknown, params?: Record<string, string>) => Promise<T>;
  URL: string;
  handleUpload: (formData: FormData) => Promise<void>;
}

interface Credentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  rol: string;
  empleado: any;
  usuario: any;
  permisos: string[];
}

interface RefreshTokenResponse {
  newToken: string;
}

const APIContext = createContext<APIContextType | null>(null);
const BASE_URL =import.meta.env.__API_URL__|| 'http://192.168.50.200:3000';
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

export function APIProvider({ children }: { children: ComponentChildren }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [URL] = useState<string>(BASE_URL);
  const refreshPromise = useRef<Promise<string> | null>(null);

  const updateToken = useCallback((newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  }, []);

  const logout = useCallback(() => {
    updateToken(null);
    localStorage.removeItem('empleado');
    localStorage.removeItem('usuario');
    localStorage.removeItem('permisos');
  }, [updateToken]);

  const refreshToken = useCallback(async (): Promise<string> => {
    if (refreshPromise.current) {
      return refreshPromise.current;
    }

    refreshPromise.current = axios.post<RefreshTokenResponse>(`${BASE_URL}/auth/refresh`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => {
        const newToken = response.data.newToken;
        updateToken(newToken);
        return newToken;
      })
      .catch(error => {
        console.error('Error refreshing token:', error);
        logout();
        throw error;
      })
      .finally(() => {
        refreshPromise.current = null;
      });

    return refreshPromise.current;
  }, [token, updateToken, logout]);

  const apiCall = useCallback(async <T,>(
    endpoint: string,
    method: string = 'GET',
    data: unknown = null,
    params: Record<string, string> | null = null
  ): Promise<T> => {
    const makeRequest = async (accessToken: string | null): Promise<AxiosResponse<T>> => {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      return axiosInstance.request<T>({
        url: endpoint,
        method,
        data,
        params,
        headers,
      });
    };

    try {
      if (!token) {
        throw new Error('No authentication token available');
      }
      const response = await makeRequest(token);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        try {
          console.log('Attempting to refresh token...');
          const newToken = await refreshToken();
          console.log('Token refreshed successfully. Retrying original request...');
          const retryResponse = await makeRequest(newToken);
          return retryResponse.data;
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          logout();
          throw refreshError;
        }
      }
      console.error('API call error:', error);
      throw error;
    }
  }, [token, refreshToken, logout]);

  const login = useCallback(async (credentials: Credentials): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
      const data = response.data;
      console.log('Login response:', data);
      updateToken(data.token);
      localStorage.setItem('empleado', JSON.stringify(data.empleado));
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      localStorage.setItem('permisos', JSON.stringify(data.permisos));
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [updateToken]);

  const handleUpload = useCallback(async (formData: FormData): Promise<void> => {
    try {
      await apiCall('/ext/videos', 'POST', formData);
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error('Error al subir el video. Por favor, intente de nuevo.');
    }
  }, [apiCall]);

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            console.log('Response interceptor: Attempting to refresh token...');
            const newToken = await refreshToken();
            console.log('Response interceptor: Token refreshed successfully. Retrying original request...');
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error('Response interceptor: Error refreshing token:', refreshError);
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [token, refreshToken, logout]);

  const contextValue: APIContextType = {
    token,
    isAuthenticated: !!token,
    login,
    logout,
    apiCall,
    URL,
    handleUpload
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
