import React, { useEffect, useState, useRef } from 'react';
import { Message, messagingService, markMessagesAsRead, sendMessage, sendTypingStatus } from '@/services/messaging';
import { initializeSocket, getSocket } from '@/services/socket';
import { formatAvatarUrl } from '@/utils/formatUtils';
import Image from 'next/image';

interface ConversationProps {
  userId: string;
  username: string;
  avatarUrl: string | null;
}

/**
 * Componente que muestra una conversación con un usuario específico
 */
export const Conversation: React.FC<ConversationProps> = ({
  userId,
  username,
  avatarUrl
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await messagingService.getConversation(userId, 1, 50);
        setMessages(data);
        setHasMore(data.length === 50);
        
        // Marcar mensajes no leídos como leídos
        const unreadMessages = data
          .filter(msg => !msg.read && msg.sender === userId)
          .map(msg => msg._id);
          
        if (unreadMessages.length > 0) {
          markMessagesAsRead(unreadMessages);
        }
      } catch (error) {
        console.error('Error al obtener mensajes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Inicializar eventos de socket
    const socket = getSocket() || initializeSocket();
    
    // Escuchar nuevos mensajes
    socket.on('new_message', (message: Message) => {
      if (message.sender === userId) {
        setMessages(prev => [...prev, message]);
        // Marcar mensaje como leído inmediatamente
        markMessagesAsRead([message._id]);
      }
    });
    
    // Escuchar estado de escritura
    socket.on('user_typing', (data: { userId: string, isTyping: boolean }) => {
      if (data.userId === userId) {
        setPartnerTyping(data.isTyping);
      }
    });
    
    // Escuchar confirmación de mensaje enviado
    socket.on('message_sent', (message: Message) => {
      if (message.recipient === userId) {
        setMessages(prev => [...prev, message]);
      }
    });
    
    return () => {
      // Limpiar event listeners
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('message_sent');
    };
  }, [userId]);
  
  useEffect(() => {
    // Desplazar al fondo cuando cambien los mensajes
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Enviar el mensaje
    sendMessage(userId, newMessage);
    
    // Limpiar el input
    setNewMessage('');
    
    // Detener indicador de escritura
    handleStopTyping();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Manejar indicador de escritura
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(userId, true);
    }
    
    // Reiniciar timeout de escritura
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(handleStopTyping, 3000);
  };
  
  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      sendTypingStatus(userId, false);
    }
  };
  
  const loadMoreMessages = async () => {
    if (!hasMore || loading) return;
    
    try {
      const nextPage = page + 1;
      const data = await messagingService.getConversation(userId, nextPage, 50);
      
      if (data.length > 0) {
        setMessages(prev => [...data, ...prev]);
        setPage(nextPage);
        setHasMore(data.length === 50);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error al cargar más mensajes:', error);
    }
  };
  
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      
      // Cargar más mensajes al desplazarse hacia arriba
      if (scrollTop === 0 && hasMore) {
        loadMoreMessages();
      }
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden">
      {/* Encabezado de conversación */}
      <div className="p-4 border-b border-gray-700 flex items-center">
        <Image
          src={formatAvatarUrl(avatarUrl) || '/avatar-placeholder.png'}
          alt={username}
          width={40}
          height={40}
          className="rounded-full"
          unoptimized={true}
        />
        <div className="ml-3">
          <h2 className="font-semibold">{username}</h2>
          {partnerTyping && (
            <p className="text-xs text-gray-400">Escribiendo...</p>
          )}
        </div>
      </div>
      
      {/* Contenedor de mensajes */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p>Cargando mensajes...</p>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="text-center my-2">
                <button 
                  onClick={loadMoreMessages}
                  className="text-sm text-blue-500 hover:text-blue-400"
                >
                  Cargar más mensajes
                </button>
              </div>
            )}
            
            {messages.map((message) => (
              <div 
                key={message._id}
                className={`mb-4 flex ${message.sender !== userId ? 'justify-end' : ''}`}
              >
                <div 
                  className={`max-w-[75%] p-3 rounded-lg ${
                    message.sender !== userId 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-gray-700 rounded-bl-none'
                  }`}
                >
                  <p>{message.content}</p>
                  <div className={`text-xs mt-1 ${message.sender !== userId ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {message.sender !== userId && message.read && (
                      <span className="ml-2">✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Input de mensaje */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-700 rounded-l-lg px-4 py-2 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white rounded-r-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};
