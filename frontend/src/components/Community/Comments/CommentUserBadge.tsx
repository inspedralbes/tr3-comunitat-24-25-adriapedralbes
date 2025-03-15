import { User } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface CommentUserBadgeProps {
    username: string;
    level?: number;
    avatarUrl?: string;
    timestamp: string;
}

export const CommentUserBadge: React.FC<CommentUserBadgeProps> = ({
    username,
    level,
    avatarUrl,
    timestamp
}) => {
    // Función para obtener el color del badge según el nivel
    const getBadgeColor = (level: number) => {
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
    const getTextColor = (level: number) => {
        return level === 8 || level === 9 ? 'text-black' : 'text-white';
    };
    return (
        <div className="flex items-center gap-2">
            <div className="relative inline-block flex-shrink-0">
                <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={username}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized={avatarUrl.includes('127.0.0.1') || avatarUrl.includes('localhost')}
                        />
                    ) : (
                        <User className="text-zinc-400" size={16} />
                    )}
                </div>
                {level && (
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getBadgeColor(level)} rounded-full flex items-center justify-center text-[10px] font-bold ${getTextColor(level)} border border-zinc-900 z-10`}>
                        {level}
                    </div>
                )}
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{username}</span>
                    <span className="text-xs text-zinc-400">{timestamp}</span>
                </div>
            </div>
        </div>
    );
};