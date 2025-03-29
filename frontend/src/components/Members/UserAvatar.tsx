import Image from 'next/image';
import React from 'react';

import { Avatar, AvatarImage as _AvatarImage, AvatarFallback } from "@/components/ui/avatar-temp";
import { normalizeAvatarUrl } from '@/utils/imageUtils';

interface UserAvatarProps {
    username: string;
    avatarUrl: string | null;
    level: number;
    size?: "sm" | "md" | "lg";
}

export function UserAvatar({ username, avatarUrl, level, size = "md" }: UserAvatarProps) {
    // Determinar el tamaño del avatar
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-14 h-14"
    };

    // Determinar el tamaño del badge de nivel
    const badgeSizeClasses = {
        sm: "w-4 h-4 text-[10px]",
        md: "w-5 h-5 text-xs",
        lg: "w-5 h-5 text-xs"
    };

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
        <div className="relative inline-block">
            <Avatar className={sizeClasses[size]}>
                {avatarUrl ? (
                    <div className="relative w-full h-full">
                        <Image 
                            src={normalizeAvatarUrl(avatarUrl) || ''} 
                            alt={username}
                            fill
                            priority
                            className="object-cover"
                            unoptimized={true} // Siempre unoptimized para asegurar compatibilidad con URLs externas
                        />
                    </div>
                ) : (
                    <AvatarFallback className="bg-[#444442] text-white">
                        {username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                )}
            </Avatar>

            {/* Level badge superpuesto en la esquina inferior derecha */}
            <div className={`absolute -bottom-1 -right-1 ${badgeSizeClasses[size]} ${getBadgeColor(level)} rounded-full flex items-center justify-center font-bold ${getTextColor(level)} border border-[#1d1d1d] z-10`}>
                {level}
            </div>
        </div>
    );
}