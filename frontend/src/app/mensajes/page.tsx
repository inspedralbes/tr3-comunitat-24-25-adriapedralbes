'use client';

import React, { useEffect, useState } from 'react';
import { ConversationList } from '@/components/Messaging/ConversationList';
import { Conversation } from '@/components/Messaging/Conversation';
import { UserSearch } from '@/components/Messaging/UserSearch';
import { initializeSocket, disconnectSocket } from '@/services/socket';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  avatarUrl: string | null;
}

/**
 * Página principal de mensajería privada
 */
export default function MessagingPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const router = useRouter();

  // Inicializar socket al cargar la página
  useEffect(() => {
    // Comprobar si el usuario está autenticado
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login'); // Redirigir a página de login si no hay token
      return;
    }

    // Inicializar la conexión de socket
    initializeSocket();

    // Limpiar al desmontar el componente
    return () => {
      disconnectSocket();
    };
  }, [router]);

  const handleSelectConversation = (userId: string, username: string, avatarUrl: string | null) => {
    setSelectedUser({
      id: userId,
      username,
      avatarUrl
    });
    setShowUserSearch(false);
  };

  const handleStartNewConversation = () => {
    setShowUserSearch(true);
    setSelectedUser(null);
  };

  const handleSelectNewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserSearch(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-8rem)]">
        {/* Panel lateral */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Mensajes</h1>
            <button
              onClick={handleStartNewConversation}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2"
              aria-label="Nuevo mensaje"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {showUserSearch ? (
            <UserSearch onSelectUser={handleSelectNewUser} />
          ) : (
            <ConversationList
              selectedUserId={selectedUser?.id || null}
              onSelectConversation={(userId, username, avatarUrl) => 
                handleSelectConversation(userId, username, avatarUrl)
              }
            />
          )}
        </div>

        {/* Panel de conversación */}
        <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden">
          {selectedUser ? (
            <Conversation
              userId={selectedUser.id}
              username={selectedUser.username}
              avatarUrl={selectedUser.avatarUrl}
            />
          ) : (
            <div className="flex justify-center items-center h-full text-gray-400">
              <div className="text-center p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-12 h-12 mx-auto mb-4 text-gray-600"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.337 21.718a6.707 6.707 0 01-.533-.074.75.75 0 01-.44-1.223 3.73 3.73 0 00.814-1.686c.023-.115-.022-.317-.254-.543C3.274 16.587 2.25 14.41 2.25 12c0-5.03 4.428-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.428 9-9.75 9-.833 0-1.643-.097-2.417-.279a6.721 6.721 0 01-4.246.997z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-lg">Selecciona una conversación o inicia una nueva</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
