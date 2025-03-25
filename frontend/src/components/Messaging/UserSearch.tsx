import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { formatAvatarUrl } from '@/utils/formatUtils';
import Image from 'next/image';

interface User {
  id: string;
  username: string;
  avatarUrl: string | null;
}

interface UserSearchProps {
  onSelectUser: (user: User) => void;
}

/**
 * Componente para buscar y seleccionar usuarios para iniciar una conversación
 */
export const UserSearch: React.FC<UserSearchProps> = ({ onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Buscar usuarios solo si hay un término de búsqueda
    if (searchTerm.trim().length < 3) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Hacer solicitud a la API para buscar usuarios
        const response = await api.get(`users/search?q=${encodeURIComponent(searchTerm)}`);
        
        // Normalizar datos de usuario
        const normalizedUsers = response.data.map((user: any) => ({
          id: user.id,
          username: user.username,
          avatarUrl: user.avatar_url || user.avatarUrl
        }));
        
        setUsers(normalizedUsers);
      } catch (error) {
        console.error('Error al buscar usuarios:', error);
        setError('No se pudieron cargar los usuarios');
      } finally {
        setLoading(false);
      }
    };

    // Debounce la búsqueda para evitar demasiadas solicitudes
    const timerId = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none"
        />
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-15rem)]">
        {loading ? (
          <div className="p-4 text-center">Buscando usuarios...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : users.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {users.map((user) => (
              <li
                key={user.id}
                className="p-4 hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => onSelectUser(user)}
              >
                <div className="flex items-center">
                  <Image
                    src={formatAvatarUrl(user.avatarUrl) || '/avatar-placeholder.png'}
                    alt={user.username}
                    width={40}
                    height={40}
                    className="rounded-full"
                    unoptimized={true}
                  />
                  <span className="ml-3 font-medium">{user.username}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : searchTerm.trim().length >= 3 ? (
          <div className="p-4 text-center text-gray-400">No se encontraron usuarios</div>
        ) : (
          <div className="p-4 text-center text-gray-400">
            Escribe al menos 3 caracteres para buscar
          </div>
        )}
      </div>
    </div>
  );
};
