import { default as _Image } from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

import { UserAvatar } from '@/components/Members/UserAvatar';

export interface LeaderboardUser {
    position: number;
    username: string;
    avatarUrl: string | null;
    points: number;
    level?: number;
    oldPosition?: number;
    isUpdated?: boolean;
}

interface LeaderboardTableProps {
    title: string;
    users: LeaderboardUser[];
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ title, users }) => {
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

    // Almacenar posiciones previas para calcular movimiento
    const [prevPositions, setPrevPositions] = useState<{[key: string]: number}>({});
    
    // Actualizar posiciones previas cuando los usuarios cambien
    useEffect(() => {
        const newPositions: {[key: string]: number} = {};
        users.forEach(user => {
            newPositions[user.username] = user.position;
        });
        setPrevPositions(newPositions);
    }, [users]);

    // Función para determinar la animación según el cambio de posición
    const getTransitionClass = (user: LeaderboardUser) => {
        if (!user.isUpdated) return '';
        
        const oldPos = user.oldPosition || prevPositions[user.username] || user.position;
        const newPos = user.position;
        
        if (oldPos === newPos) {
            // Sólo puntos actualizados, sin cambio de posición
            return 'transition-all duration-300 bg-blue-500/20 shadow-md shadow-blue-500/50 scale-105';
        } else if (oldPos > newPos) {
            // Subió de posición (número menor = mejor ranking)
            return 'animate-slide-up bg-green-500/20 shadow-md shadow-green-500/50 border-2 border-green-400 scale-110';
        } else {
            // Bajó de posición (número mayor = peor ranking)
            return 'animate-slide-down bg-red-500/20 shadow-md shadow-red-500/50 border-2 border-red-400 scale-105';
        }
    };

    return (
        <div className="bg-[#323230]/90 rounded-lg border border-white/10 p-4">
            <h2 className="font-medium text-white mb-4">{title}</h2>

            <div className="space-y-4">
                {users.map((user) => (
                    <div 
                        key={`${title}-${user.username}`} 
                        className={`flex items-center gap-3 mb-4 last:mb-0 rounded-md px-2 py-1 transition-all duration-500 ${getTransitionClass(user)}`}
                        data-position={user.position}
                        data-username={user.username}
                        data-points={user.points}
                    >
                        <div className={`w-8 h-8 ${getPositionBadgeColor(user.position)} rounded-full flex items-center justify-center text-sm font-bold border`}>
                            {user.position}
                        </div>
                        <UserAvatar 
                            username={user.username} 
                            avatarUrl={user.avatarUrl} 
                            level={user.level || 1}
                            size="sm"
                        />
                        <span className="text-sm font-medium flex-1 text-white">{user.username}</span>
                        <span className={`text-sm ${user.position <= 3 ? 'text-blue-300' : 'text-blue-400'} transition-all duration-300`}>
                            {user.position <= 3 ? '+' : ''}
                            <span className={user.isUpdated ? 'animate-ping font-bold text-yellow-400 inline-block' : ''}>{user.points}</span>
                            {user.isUpdated && 
                                <span className="ml-1 inline-block animate-bounce-once text-xs text-green-400">
                                    +{(user.points - (prevPositions[user.username] || 0))}
                                </span>
                            }
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};