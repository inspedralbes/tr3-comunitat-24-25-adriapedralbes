import { Dispatch, SetStateAction } from 'react';

/**
 * Función que maneja el cierre de un modal, evitando parpadeos y
 * controlando el estado de carga
 */
export const createModalCloseHandler = (
  setSkipLoadingIndicator: Dispatch<SetStateAction<boolean>>,
  setSelectedPost: Dispatch<SetStateAction<unknown | null>>,
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
) => {
  return () => {
    // Activar el flag para evitar que se muestre el skeleton durante la recarga
    setSkipLoadingIndicator(true);
    
    // Restaurar la URL original al cerrar el modal sin usar router (evita parpadeo)
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/comunidad');
    }
    
    // Primero cerramos el modal para evitar parpadeos
    setSelectedPost(null); // Importante: resetear el post seleccionado
    setIsModalOpen(false);
  
    // Bloquear cualquier posible actualización de isLoading por un tiempo
    const timeoutHandle = setTimeout(() => {
      setSkipLoadingIndicator(false);
    }, 2000); // Tiempo suficiente para que cualquier actualización se complete
    
    return () => clearTimeout(timeoutHandle);
  };
};
