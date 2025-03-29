import Image from 'next/image';
import React from 'react';
import { normalizeAvatarUrl } from '@/utils/imageUtils';

interface UserLargeAvatarProps {
    username: string;
    avatarUrl: string | null;
    level: number;
}

export function UserLargeAvatar({ username, avatarUrl, level }: UserLargeAvatarProps) {
    // Obtener el color del borde según el nivel
    const getBadgeColor = (level: number) => {
        const colors: Record<number, string> = {
            1: 'border-gray-500 bg-gray-500',
            2: 'border-green-500 bg-green-500',
            3: 'border-blue-500 bg-blue-500',
            4: 'border-indigo-500 bg-indigo-500',
            5: 'border-purple-500 bg-purple-500',
            6: 'border-pink-500 bg-pink-500',
            7: 'border-red-500 bg-red-500',
            8: 'border-yellow-500 bg-yellow-500',
            9: 'border-amber-500 bg-amber-500',
            10: 'border-orange-500 bg-orange-500',
        };
        return colors[level] || 'border-blue-600 bg-blue-600';
    };
    
    // Determinar si el texto debe ser negro (para fondos claros)
    const getDarkTextClass = (level: number) => {
        return level === 8 || level === 9 ? 'text-black' : 'text-white';
    };
    
    const badgeColorClasses = getBadgeColor(level);
    const textColorClass = getDarkTextClass(level);
    
    return (
        <div className="relative inline-block">
            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${badgeColorClasses.split(' ')[0]}`}>
                {avatarUrl ? (
                    <div className="w-full h-full">
                        <Image 
                            src={normalizeAvatarUrl(avatarUrl) || '/default-avatar.png'} 
                            alt={username}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                            unoptimized={true}
                            onError={(e) => {
                                // Si la imagen falla, mostrar las iniciales del usuario
                                console.error('Error loading avatar in Ranking:', avatarUrl);
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; // Prevenir llamadas recursivas
                                target.style.display = 'none';
                                (target.parentElement as HTMLElement).textContent = username.charAt(0).toUpperCase();
                                target.parentElement!.classList.add('flex', 'items-center', 'justify-center', 'bg-blue-500', 'text-white', 'font-bold', 'text-4xl');
                            }}
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold text-4xl">
                        {username.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            
            {/* Badge de nivel */}
            <div className={`absolute -bottom-2 right-0 w-12 h-12 rounded-full ${badgeColorClasses.split(' ')[1]} flex items-center justify-center text-xl font-bold ${textColorClass} border-4 border-[#1F1F1E]`}>
                {level}
            </div>
        </div>
    );
}