// Placeholder para evitar errores de compilación
// Normalmente deberíamos usar: import { io, Socket } from 'socket.io-client';

interface Socket {
  on: (event: string, callback: Function) => void;
  off: (event: string) => void;
  emit: (event: string, ...args: any[]) => void;
  disconnect: () => void;
}

let socket: Socket | null = null;

/**
 * Inicializa la conexión de Socket.io
 */
export const initializeSocket = (): Socket => {
  if (socket) return socket;

  // Crear un mock del socket para que la aplicación compile
  socket = {
    on: (event: string, callback: Function) => {
      console.log(`[Mock Socket] Registrado evento: ${event}`);
    },
    off: (event: string) => {
      console.log(`[Mock Socket] Eliminado evento: ${event}`);
    },
    emit: (event: string, ...args: any[]) => {
      console.log(`[Mock Socket] Emitido evento: ${event}`, args);
    },
    disconnect: () => {
      console.log(`[Mock Socket] Desconectado`);
      socket = null;
    }
  };

  console.log('[Mock Socket] Conectado - Esta es una implementación temporal');
  
  return socket;
};

/**
 * Obtiene la instancia actual del socket
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Desconecta el socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
