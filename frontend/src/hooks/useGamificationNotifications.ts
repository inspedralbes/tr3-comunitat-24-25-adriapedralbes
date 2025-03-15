import { useState, useCallback, useEffect } from 'react';
import { GamificationNotification } from '@/components/gamification/AchievementNotification';

export const useGamificationNotifications = () => {
  const [notifications, setNotifications] = useState<GamificationNotification[]>([]);
  const [activeNotification, setActiveNotification] = useState<GamificationNotification | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [queue, setQueue] = useState<GamificationNotification[]>([]);

  // Función para añadir nueva notificación a la cola
  const addNotification = useCallback((notification: GamificationNotification) => {
    setQueue(prev => [...prev, notification]);
  }, []);

  // Función para manejar cambio de estado de visibilidad de la notificación
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    
    // Si se cierra la notificación, procesar la siguiente en cola
    if (!open) {
      setTimeout(() => {
        setActiveNotification(null);
      }, 300); // Dar tiempo para la animación de cierre
    }
  }, []);

  // Efecto para procesar la cola de notificaciones
  useEffect(() => {
    if (queue.length > 0 && !activeNotification && !isOpen) {
      // Obtener la primera notificación de la cola
      const nextNotification = queue[0];
      
      // Mostrar la notificación
      setActiveNotification(nextNotification);
      setIsOpen(true);
      
      // Eliminar la notificación de la cola
      setQueue(prev => prev.slice(1));
      
      // Agregar a la lista de notificaciones mostradas
      setNotifications(prev => [...prev, nextNotification]);
    }
  }, [queue, activeNotification, isOpen]);

  // Función para registrar una notificación de logro
  const notifyAchievementUnlock = useCallback((data: Omit<GamificationNotification & { type: 'achievement' }, 'type'>) => {
    addNotification({
      type: 'achievement',
      ...data
    });
  }, [addNotification]);

  // Función para registrar una notificación de subida de nivel
  const notifyLevelUp = useCallback((data: Omit<GamificationNotification & { type: 'level-up' }, 'type'>) => {
    addNotification({
      type: 'level-up',
      ...data
    });
  }, [addNotification]);

  return {
    // Estado
    activeNotification,
    isOpen,
    allNotifications: notifications,
    
    // Acciones
    handleOpenChange,
    notifyAchievementUnlock,
    notifyLevelUp
  };
};

export default useGamificationNotifications;
