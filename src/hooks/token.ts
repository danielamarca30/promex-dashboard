import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

// Crear el contexto
export const TokenContext = createContext(null);

// Hook personalizado para usar el token
export function useToken() {
  const token = useContext(TokenContext);
  if (token === undefined) {
    throw new Error('useToken debe ser usado dentro de un TokenProvider');
  }
  return token;
}