import { useEffect, useState, useCallback } from 'react';
import socketService from '@/services/socket';
import { LeaderboardUserFormatted } from '@/services/ranking';

/**
 * Hook personalizado para suscribirse a actualizaciones de ranking en tiempo real.
 * 
 * @param apiUrl URL de la API para inicializar el socket
 * @param initialUsers Lista inicial de usuarios del leaderboard
 * @returns Un objeto con los usuarios actualizados y una función para actualizar manualmente
 */
export function useRankingUpdates(
  apiUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  initialUsers: any[] = []
) {
  const [users, setUsers] = useState<any[]>(initialUsers);

  // Función para manejar las actualizaciones de ranking
  const handleRankingUpdate = useCallback((userData: any) => {
    console.log('Recibida actualización de ranking en hook:', userData);
    
    setUsers(prevUsers => {
      // Si no hay usuarios aún, no podemos actualizar
      if (!prevUsers || prevUsers.length === 0) return prevUsers;
      
      // Obtener una copia de los usuarios actuales
      const updatedUsers = [...prevUsers];
      
      // Buscar al usuario actualizado por username
      const userIndex = updatedUsers.findIndex(u => u.username === userData.username);
      
      if (userIndex === -1) {
        // El usuario no está en la lista, puede que ahora califique para entrar
        // Esto es más complejo y requeriría recalcular todo el ranking
        return prevUsers;
      }
      
      // Guardar posición anterior para la animación
      const oldPosition = updatedUsers[userIndex].position;
      
      // Actualizar los datos del usuario
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        points: userData.points,
        position: userData.position,
        oldPosition: oldPosition,
        isUpdated: true
      };
      
      // Si la posición cambió, ajustar otros usuarios afectados
      if (oldPosition !== userData.position) {
        // Si subió posiciones (número menor = mejor ranking)
        if (userData.position < oldPosition) {
          // Todos los usuarios entre la nueva posición y la antigua bajan una posición
          for (let i = 0; i < updatedUsers.length; i++) {
            if (i !== userIndex && 
                updatedUsers[i].position >= userData.position && 
                updatedUsers[i].position < oldPosition) {
              updatedUsers[i].oldPosition = updatedUsers[i].position;
              updatedUsers[i].position += 1;
              updatedUsers[i].isUpdated = true;
            }
          }
        } 
        // Si bajó posiciones (número mayor = peor ranking)
        else if (userData.position > oldPosition) {
          // Todos los usuarios entre la antigua posición y la nueva suben una posición
          for (let i = 0; i < updatedUsers.length; i++) {
            if (i !== userIndex && 
                updatedUsers[i].position <= userData.position && 
                updatedUsers[i].position > oldPosition) {
              updatedUsers[i].oldPosition = updatedUsers[i].position;
              updatedUsers[i].position -= 1;
              updatedUsers[i].isUpdated = true;
            }
          }
        }
      }
      
      // Ordenar por posición después de las actualizaciones
      updatedUsers.sort((a, b) => a.position - b.position);
      
      return updatedUsers;
    });
  }, []);

  // Efecto para inicializar el socket y la suscripción
  useEffect(() => {
    // Inicializar socket
    const eventSource = socketService.initSocket(apiUrl);
    
    // Suscribirse a actualizaciones de ranking
    const unsubscribe = socketService.subscribeToRankingUpdates(handleRankingUpdate);
    
    // Limpiar suscripción al desmontar
    return () => {
      unsubscribe();
      // No cerramos el socket aquí para permitir que otros componentes lo usen
    };
  }, [apiUrl, handleRankingUpdate]);

  // Efecto para actualizar los usuarios cuando cambian los iniciales
  useEffect(() => {
    if (initialUsers && initialUsers.length > 0) {
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  // Función para forzar una actualización manual (útil para sincronizar después de acciones)
  const forceUpdate = useCallback((newUsers: any[]) => {
    setUsers(newUsers);
  }, []);

  return { users, forceUpdate };
}
