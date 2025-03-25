import React, { useEffect, useState } from 'react';
import { Conversation, messagingService } from '@/services/messaging';
import { formatAvatarUrl } from '@/utils/formatUtils';
import Image from 'next/image';

interface ConversationListProps {
  selectedUserId: string | null;
  onSelectConversation: (userId: string) => void;
}

/**
 * Componente que muestra la lista de conversaciones del usuario
 */
export const ConversationList: React.FC<ConversationListProps> = ({
  selectedUserId,
  onSelectConversation
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await messagingService.getConversations();
        setConversations(data);
      } catch (error) {
        console.error('Error al obtener conversaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    
    // Establecer sondeo para actualizar conversaciones
    const intervalId = setInterval(fetchConversations, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Cargando conversaciones...</div>;
  }

  if (conversations.length === 0) {
    return <div className="p-4 text-center">No tienes conversaciones</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <h2 className="text-lg font-semibold p-4 border-b border-gray-700">Mensajes</h2>
      <ul className="divide-y divide-gray-700">
        {conversations.map((conversation) => (
          <li 
            key={conversation.partnerId}
            className={`cursor-pointer hover:bg-gray-700 transition-colors ${
              selectedUserId === conversation.partnerId ? 'bg-gray-700' : ''
            }`}
            onClick={() => onSelectConversation(conversation.partnerId)}
          >
            <div className="flex items-center p-4">
              <div className="relative">
                <Image
                  src={formatAvatarUrl(conversation.latestMessage.senderUsername) || '/avatar-placeholder.png'}
                  alt={conversation.latestMessage.senderUsername || ''}
                  width={48}
                  height={48}
                  className="rounded-full"
                  unoptimized={true}
                />
                {conversation.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <p className="font-medium truncate">
                    {conversation.latestMessage.senderUsername || 'Usuario'}
                  </p>
                  <span className="text-xs text-gray-400">
                    {new Date(conversation.latestMessage.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium' : 'text-gray-400'}`}>
                  {conversation.latestMessage.content}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
