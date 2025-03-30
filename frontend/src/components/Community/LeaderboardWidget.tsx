import { Trophy, User } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react';
import socketService from '@/services/socket';

interface LeaderboardUser {
    position: number;
    username: string;
    avatar_url?: string;  // Nombre del campo según backend
    points: number;
    level?: number;
}

interface LeaderboardWidgetProps {
    users: LeaderboardUser[];
    period?: string;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
    users: initialUsers,
    period = '30 días'
}) => {
    // Estado para los usuarios con sus posiciones actuales
    const [users, setUsers] = useState(initialUsers);
    // Estado para controlar qué usuarios están en transición
    const [transitions, setTransitions] = useState<{[key: string]: {
        animating: boolean;
        direction: 'up' | 'down' | null;
        newPoints: number;
    }}>({});
    // Referencia para el eventSource
    const eventSourceRef = useRef<EventSource | null>(null);
    // Referencia para almacenar timeouts
    const timeoutsRef = useRef<{[key: string]: NodeJS.Timeout}>({});

    // Función para obtener el color del badge según la posición
    const getPositionBadgeColor = (position: number) => {
        switch (position) {
            case 1:
                return 'bg-amber-500 border-amber-400';
            case 2:
                return 'bg-zinc-400 border-zinc-300';
            case 3:
                return 'bg-amber-700 border-amber-600';
            default:
                return 'bg-[#444442] border-white/20';
        }
    };

    // Función para obtener el color del badge según el nivel
    const getLevelBadgeColor = (level: number) => {
        const colors: Record<number, string> = {
            1: 'bg-gray-500',
            2: 'bg-green-500',
            3: 'bg-blue-500',
            4: 'bg-indigo-500',
            5: 'bg-purple-500',
            6: 'bg-pink-500',
            7: 'bg-red-500',
            8: 'bg-yellow-500',
            9: 'bg-amber-500',
            10: 'bg-orange-500',
        };
        return colors[level] || 'bg-blue-500';
    };

    // Determinar si el texto debe ser negro (para fondos claros)
    const getLevelTextColor = (level: number) => {
        return level === 8 || level === 9 ? 'text-black' : 'text-white';
    };

    // Actualizar usuarios cuando cambian los initialUsers sin mostrar animaciones
    useEffect(() => {
        // Actualizamos los usuarios sin animaciones al recargar la página
        setUsers(initialUsers);
        // Restear las transiciones para no mostrar animaciones al recargar
        setTransitions({});
    }, [initialUsers]);

    // Efecto para conectar con el servidor y manejar actualizaciones
    useEffect(() => {
        const connectToSocketServer = () => {
            // Inicializar conexión con servidor
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            console.log('Iniciando conexión con servidor de eventos...');
            eventSourceRef.current = socketService.initSocket(apiUrl);
            
            if (!eventSourceRef.current) {
                console.error('No se pudo iniciar la conexión SSE');
                // Reintentar después de un tiempo
                setTimeout(connectToSocketServer, 5000);
                return;
            }
        };
        
        // Iniciar conexión al montar
        connectToSocketServer();
        
        // Función para manejar actualizaciones de ranking
        const handleRankingUpdate = (userData: any) => {
            try {
                // Verificar que los datos son válidos
                if (!userData || !userData.username) {
                    console.error('Datos de actualización inválidos:', userData);
                    return;
                }
                
                const updatedUsername = userData.username;
                const newPoints = userData.points;
                const newPosition = userData.position;

                console.log(`Recibida actualización para ${updatedUsername}:`, userData);

                // Verificar si el usuario está en la lista y su posición actual
                setUsers(currentUsers => {
                    const userIndex = currentUsers.findIndex(u => u.username === updatedUsername);
                    if (userIndex === -1) {
                        console.log(`Usuario ${updatedUsername} no está en la lista actual`);
                        return currentUsers; // No está en la lista
                    }

                    const oldPosition = currentUsers[userIndex].position;
                    const oldPoints = currentUsers[userIndex].points;
                    
                    // Determinar la dirección del cambio
                    let direction: 'up' | 'down' | null = null;
                    if (newPosition < oldPosition) {
                        direction = 'up'; // Subió en el ranking
                        console.log(`${updatedUsername} subió: ${oldPosition} -> ${newPosition}`);
                    } else if (newPosition > oldPosition) {
                        direction = 'down'; // Bajó en el ranking
                        console.log(`${updatedUsername} bajó: ${oldPosition} -> ${newPosition}`);
                    } else {
                        console.log(`${updatedUsername} mantuvo posición ${oldPosition}, puntos: ${oldPoints} -> ${newPoints}`);
                    }

                    // Marcar la transición para la animación solo si son puntos nuevos
                    // (evitar actualizaciones repetidas al recargar)
                    if (oldPoints !== newPoints) {
                        setTransitions(prev => ({
                            ...prev,
                            [updatedUsername]: {
                                animating: true,
                                direction,
                                newPoints
                            }
                        }));
                    }

                    // Actualizar usuario en la lista y ordenar todo en un paso
                    const updatedAndSortedUsers = currentUsers.map(u => {
                        if (u.username === updatedUsername) {
                            return {
                                ...u,
                                points: newPoints,
                                position: newPosition,
                                level: userData.level || u.level
                            };
                        }
                        return u;
                    }).sort((a, b) => a.position - b.position);
                    
                    // Después de un tiempo para la animación, quitar los efectos visuales
                    if (timeoutsRef.current[updatedUsername]) {
                        clearTimeout(timeoutsRef.current[updatedUsername]);
                    }

                    timeoutsRef.current[updatedUsername] = setTimeout(() => {
                        // Quitar la animación
                        setTransitions(prev => {
                            const newTransitions = {...prev};
                            delete newTransitions[updatedUsername];
                            return newTransitions;
                        });
                    }, 1500); // Tiempo para la animación

                    return updatedAndSortedUsers;
                });
            } catch (error) {
                console.error('Error procesando actualización de ranking:', error);
            }
        };

        // Suscribirse a las actualizaciones
        const unsubscribe = socketService.subscribeToRankingUpdates(handleRankingUpdate);

        // Limpieza al desmontar
        return () => {
            unsubscribe();
            if (eventSourceRef.current) {
                socketService.closeSocket();
                eventSourceRef.current = null;
            }
            // Limpiar timeouts
            Object.values(timeoutsRef.current).forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    return (
        <div className="bg-[#323230]/90 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="text-amber-400" size={18} />
                <h3 className="font-medium text-white">Ranking ({period})</h3>
            </div>

            <div className="space-y-3 relative">
                {users.map((user) => {
                    const transition = transitions[user.username];
                    const isAnimating = transition?.animating || false;
                    const direction = transition?.direction;
                    
                    // Clases para animación (sin borde azul animado)
                    let animationClass = '';
                    if (isAnimating) {
                        if (direction === 'up') {
                            animationClass = 'origin-center transition duration-1000 transform scale-105 -translate-y-2 bg-green-500/10 shadow-lg shadow-green-500/20 z-10 relative';
                        } else if (direction === 'down') {
                            animationClass = 'origin-center transition duration-1000 transform scale-95 translate-y-2 bg-red-500/10 shadow-lg shadow-red-500/20 relative';
                        } else {
                            // Solo puntos actualizados - sin efecto de borde azul animado
                            animationClass = 'origin-center transition duration-500 transform scale-105 relative';
                        }
                    }

                    return (
                        <div 
                            key={user.username} 
                            className={`flex items-center gap-3 p-1.5 rounded-md ${animationClass}`}
                            data-username={user.username}
                            data-position={user.position}
                        >
                            <div className={`w-6 h-6 ${getPositionBadgeColor(user.position)} rounded-full flex items-center justify-center text-xs font-bold border border-white/10 ${isAnimating ? 'animate-pulse' : ''}`}>
                                {/* Calcular la posición real basada en el índice en el array ordenado */}
                                {users.findIndex(u => u.username === user.username) + 1}
                            </div>
                            <div className="relative flex-shrink-0">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                    {user.avatar_url ? (
                                        <Image
                                            src={user.avatar_url}
                                            alt={user.username}
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover"
                                            unoptimized={true}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-700 text-zinc-400">
                                            <User size={16} />
                                        </div>
                                    )}
                                </div>
                                {user.level && (
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getLevelBadgeColor(user.level)} rounded-full flex items-center justify-center text-[10px] font-bold ${getLevelTextColor(user.level)} border border-zinc-900 z-10`}>
                                        {user.level}
                                    </div>
                                )}
                            </div>
                            <span className="text-sm font-medium flex-1 text-white">{user.username}</span>
                            
                            {/* Animación de puntos */}
                            <div className="relative min-w-[40px] text-right">
                                {isAnimating ? (
                                    <>
                                        <span className="text-sm text-blue-300 absolute right-0 animate-fade-out">
                                            +{user.points < transition.newPoints ? user.points : transition.newPoints}
                                        </span>
                                        <span className="text-sm text-yellow-300 font-bold animate-fade-in">
                                            +{transition.newPoints}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-sm text-blue-300">
                                        +{user.points}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 text-center">
                <a href="/ranking" className="text-xs text-blue-300 hover:text-blue-200 hover:underline">
                    Ver ranking completo
                </a>
            </div>
        </div>
    );
};
