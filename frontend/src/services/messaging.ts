import { api } from './api';
import { getSocket, initializeSocket } from './socket';

export interface Message {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  read: boolean;
  timestamp: string;
  senderUsername?: string;
}

export interface Conversation {
  partnerId: string;
  latestMessage: Message;
  unreadCount: number;
}

/**
 * Servicio para gestionar la mensajería y comunicación con la API
 * NOTA: Esta es una implementación temporal mientras se resuelve el problema de socket.io-client
 */
export const messagingService = {
  // Obtener todas las conversaciones del usuario actual
  getConversations: async (): Promise<Conversation[]> => {
    // Implementación de ejemplo para desarrollo
    return [
      {
        partnerId: '1',
        latestMessage: {
          _id: '1',
          sender: '1',
          recipient: 'me',
          content: 'Hola, ¿cómo estás?',
          read: false,
          timestamp: new Date().toISOString(),
          senderUsername: 'Usuario Demo'
        },
        unreadCount: 1
      }
    ];
  },

  // Obtener mensajes para una conversación específica
  getConversation: async (userId: string, page = 1, limit = 50): Promise<Message[]> => {
    // Implementación de ejemplo para desarrollo
    return [
      {
        _id: '1',
        sender: userId,
        recipient: 'me',
        content: 'Hola, ¿cómo estás?',
        read: false,
        timestamp: new Date(Date.now() - 60000).toISOString(),
        senderUsername: 'Usuario Demo'
      },
      {
        _id: '2',
        sender: 'me',
        recipient: userId,
        content: 'Muy bien, ¿y tú?',
        read: true,
        timestamp: new Date(Date.now() - 30000).toISOString()
      }
    ];
  },

  // Marcar mensaje como leído
  markAsRead: async (messageId: string): Promise<Message> => {
    // Implementación de ejemplo para desarrollo
    return {
      _id: messageId,
      sender: '1',
      recipient: 'me',
      content: 'Mensaje de prueba',
      read: true,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Envía un mensaje privado al destinatario especificado
 */
export const sendMessage = (recipientId: string, content: string): void => {
  const socket = getSocket() || initializeSocket();
  socket.emit('private_message', { recipientId, content });
};

/**
 * Marca múltiples mensajes como leídos
 */
export const markMessagesAsRead = (messageIds: string[]): void => {
  const socket = getSocket() || initializeSocket();
  socket.emit('mark_read', { messageIds });
};

/**
 * Envía el estado de escritura al destinatario
 */
export const sendTypingStatus = (recipientId: string, isTyping: boolean): void => {
  const socket = getSocket() || initializeSocket();
  socket.emit('typing', { recipientId, isTyping });
};

/**
 * Solicita el estado en línea de múltiples usuarios
 */
export const getOnlineStatus = (userIds: string[]): void => {
  const socket = getSocket() || initializeSocket();
  socket.emit('get_online_status', { userIds });
};
