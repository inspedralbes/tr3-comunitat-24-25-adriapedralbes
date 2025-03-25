/**
 * Socket.io-client mock para desarrollo sin la dependencia
 */

export interface Socket {
  on: (event: string, callback: Function) => void;
  off: (event: string) => void;
  emit: (event: string, ...args: any[]) => void;
  disconnect: () => void;
}

export const io = (url: string, options?: any): Socket => {
  console.log(`[Mock Socket] Connecting to ${url}`);
  
  return {
    on: (event: string, callback: Function) => {
      console.log(`[Mock Socket] Registered event: ${event}`);
    },
    off: (event: string) => {
      console.log(`[Mock Socket] Removed event: ${event}`);
    },
    emit: (event