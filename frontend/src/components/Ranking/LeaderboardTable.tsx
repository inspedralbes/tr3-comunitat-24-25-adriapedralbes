import React from 'react';
import Image from 'next/image';

export interface LeaderboardUser {
    position: number;
    username: string;
    avatarUrl: string;
    points: number;
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

    return (
        <div className="bg-[#323230]/90 rounded-lg border border-white/10 p-4">
            <h2 className="font-medium text-white mb-4">{title}</h2>

            <div className="space-y-4">
                {users.map((user) => (
                    <div key={`${title}-${user.username}`} className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${getPositionBadgeColor(user.position)} rounded-full flex items-center justify-center text-sm font-bold border`}>
                            {user.position}
                        </div>
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                            <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-sm font-medium flex-1 text-white">{user.username}</span>
                        <span className={`text-sm ${user.position <= 3 ? 'text-blue-300' : 'text-blue-400'}`}>
                            {user.position <= 3 ? '+' : ''}
                            {user.points}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};