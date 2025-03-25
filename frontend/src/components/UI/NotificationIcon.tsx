import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { messagingService } from '@/services/messaging';
import { initializeSocket, getSocket } from '@/services/socket';

/**
 * Ícono de notificación para mensajes no leídos
 */
export const NotificationIcon: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  
  useEffect(() => {
    // Inicializar socket si aún no está inicializado
    const socket = getSocket() || initializeSocket();
    
    // Obtener recuento inicial de no leídos
    fetchUnreadCount();
    
    // Escuchar nuevos mensajes
    socket.on('new_message', () => {
      fetchUnreadCount();
    });
    
    // Escuchar mensajes que han sido leídos
    socket.on('messages_read', () => {
      fetchUnreadCount();
    });
    
    // Configurar sondeo para actualizar contador de no leídos
    const intervalId = setInterval(fetchUnreadCount, 60000);
    
    return () => {
      clearInterval(intervalId);
      socket.off('new_message');
      socket.off('messages_read');
    };
  }, []);
  
  const fetchUnreadCount = async () => {
    try {
      const conversations = await messagingService.getConversations();
      const totalUnread = conversations.reduce((count, conv) => count + conv.unreadCount, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error al obtener contador de no leídos:', error);
    }
  };
  
  const handleClick = () => {
    router.push('/mensajes');
  };
  
  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-full hover:bg-gray-700 transition-colors"
      aria-label="Mensajes"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path
          fillRule="evenodd"
          d="M5.337 21.718a6.707 6.707 0 01-.533-.074.75.75 0 01-.44-1.223 3.73 3.73 0 00.814-1.686c.023-.115-.022-.317-.254-.543C3.274 16.587 2.25 14.41 2.25 12c0-5.03 4.428-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.428 9-9.75 9-.833 0-1.643-.097-2.417-.279a6.721 6.721 0 01-4.246.997z"
          clipRule="evenodd"
        />
      </svg>
      
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};
