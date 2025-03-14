import React from 'react';
import Image from 'next/image';

interface UserLargeAvatarProps {
    username: string;
    avatarUrl: string | null;
    level: number;
}

export function UserLargeAvatar({ username, avatarUrl, level }: UserLargeAvatarProps) {
    return (
        <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-600">
                {avatarUrl ? (
                    <div className="w-full h-full">
                        <Image 
                            src={avatarUrl} 
                            alt={username}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                            unoptimized={avatarUrl.includes('127.0.0.1') || avatarUrl.includes('localhost')}
                            onError={(e) => {
                                // Si la imagen falla, mostrar las iniciales del usuario
                                const target = e.target as HTMLImageElement;
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
            <div className="absolute -bottom-2 right-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white border-4 border-[#1F1F1E]">
                {level}
            </div>
        </div>
    );
}