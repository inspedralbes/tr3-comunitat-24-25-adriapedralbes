import { LeaderboardUserFormatted } from './ranking';

// Tipo para los callbacks de eventos
type RankingUpdateCallback = (userData: any) => void;
const rankingUpdateCallbacks: RankingUpdateCallback[] = [];

// Variable para almacenar la instancia de EventSource (SSE)
let eventSource: EventSource | null = null;

// Función para inicializar la conexión SSE
export const initSocket = (apiUrl: string): EventSource | null => {
  try {
    // Cerrar cualquier conexión existente primero
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    
    // Construir la URL del endpoint SSE
    const baseUrl = apiUrl.replace(/\/api$/, '');
    const sseUrl = `${baseUrl}/api/sse/ranking-updates/`;
    
    console.log('Conectando a servidor de eventos SSE en:', sseUrl);
    
    // Crear instancia de EventSource (SSE)
    eventSource = new EventSource(sseUrl);
    
    // Manejar eventos de conexión
    eventSource.addEventListener('connected', (event) => {
      console.log('Conectado al servidor SSE:', event.data);
    });
    
    // Ignorar eventos iniciales (test) que no son actualizaciones reales
    eventSource.addEventListener('test', (event) => {
      console.log('Conexión SSE probada correctamente');
    });
    
    // Crear variable para almacenar los últimos datos recibidos por usuario
    const lastReceivedEvents = new Map();
    
    // Manejar eventos de actualización de ranking
    eventSource.addEventListener('ranking_update', (event) => {
      try {
        const userData = JSON.parse(event.data);
        
        // Comprobar si ya hemos procesado este evento para este usuario con estos puntos
        const userId = userData.username;
        const currentPoints = userData.points;
        const lastEvent = lastReceivedEvents.get(userId);
        
        if (lastEvent && lastEvent.points === currentPoints) {
          console.log('Ignorando evento duplicado para:', userId);
          return;
        }
        
        // Guardar este evento como el último recibido para este usuario
        lastReceivedEvents.set(userId, {
          points: currentPoints,
          timestamp: Date.now()
        });
        
        console.log('Recibida actualización de ranking:', userData);
        
        // Notificar a todos los callbacks registrados
        rankingUpdateCallbacks.forEach(callback => callback(userData));
      } catch (error) {
        console.error('Error al procesar evento de ranking:', error);
      }
    });
    
    // Manejar errores y reconexión
    eventSource.onerror = (error) => {
      console.warn('Error en la conexión SSE, intentando reconectar automáticamente...');
      
      // Si el estado es closed, reintentar conexión después de un breve retraso
      if (eventSource && eventSource.readyState === EventSource.CLOSED) {
        eventSource.close();
        eventSource = null;
        
        // Reintentar conexión después de 3 segundos
        setTimeout(() => {
          console.log('Reintentando conexión SSE...');
          initSocket(apiUrl);
        }, 3000);
      }
    };
    
    return eventSource;
  } catch (error) {
    console.error('Error al crear conexión SSE:', error);
    return null;
  }
};

// Función para suscribirse a actualizaciones de ranking
export const subscribeToRankingUpdates = (callback: RankingUpdateCallback): () => void => {
  rankingUpdateCallbacks.push(callback);
  
  // Retornar función para cancelar suscripción
  return () => {
    const index = rankingUpdateCallbacks.indexOf(callback);
    if (index !== -1) {
      rankingUpdateCallbacks.splice(index, 1);
    }
  };
};

// Función para actualizar la posición y realizar animación
export const updateUserRanking = (
  users: LeaderboardUserFormatted[],
  updatedUser: any
): LeaderboardUserFormatted[] => {
  // Crear una copia del array de usuarios
  const updatedUsers = [...users];
  
  // Buscar al usuario actualizado
  const userIndex = updatedUsers.findIndex(u => u.username === updatedUser.username);
  
  if (userIndex === -1) {
    // Si el usuario no está en la lista, simplemente devolver la lista original
    return users;
  }
  
  // Actualizar datos del usuario
  updatedUsers[userIndex] = {
    ...updatedUsers[userIndex],
    points: updatedUser.points,
    level: updatedUser.level || updatedUsers[userIndex].level,
    // Mantener posición actual temporalmente (la animación se manejará en el componente)
    oldPosition: updatedUsers[userIndex].position,
    position: updatedUser.position,
    isUpdated: true, // Marcar como actualizado para la animación
  };
  
  // Ordenar por posición
  updatedUsers.sort((a, b) => a.position - b.position);
  
  return updatedUsers;
};

// Función para cerrar conexión
export const closeSocket = (): void => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
};

export default {
  initSocket,
  subscribeToRankingUpdates,
  updateUserRanking,
  closeSocket,
};
