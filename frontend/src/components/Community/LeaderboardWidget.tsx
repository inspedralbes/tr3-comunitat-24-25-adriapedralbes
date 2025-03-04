import { Trophy } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface LeaderboardUser {
    position: number;
    username: string;
    avatarUrl: string;
    points: number;
}

interface LeaderboardWidgetProps {
    users: LeaderboardUser[];
    period?: string;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
    users,
    period = '30-day'
}) => {
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
        <div className="bg-[#323230]/90 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="text-amber-400" size={18} />
                <h3 className="font-medium text-white">Leaderboard ({period})</h3>
            </div>

            <div className="space-y-3">
                {users.map((user) => (
                    <div key={user.username} className="flex items-center gap-3">
                        <div className={`w-6 h-6 ${getPositionBadgeColor(user.position)} rounded-full flex items-center justify-center text-xs font-bold border border-white/10`}>
                            {user.position}
                        </div>
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                            <Image
                                src={user.avatarUrl}
                                alt={user.username}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-sm font-medium flex-1 text-white">{user.username}</span>
                        <span className="text-sm text-blue-300">+{user.points}</span>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-center">
                <a href="/leaderboards" className="text-xs text-blue-300 hover:text-blue-200 hover:underline">
                    See all leaderboards
                </a>
            </div>
        </div>
    );
};