"use client";

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
    username: string;
    avatarUrl: string;
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

    return (
        <div className="relative inline-block">
            <Avatar className={sizeClasses[size]}>
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback className="bg-[#444442] text-white">
                    {username.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>

            {/* Level badge superpuesto en la esquina inferior derecha */}
            <div className={`absolute -bottom-1 -right-1 ${badgeSizeClasses[size]} bg-blue-500 rounded-full flex items-center justify-center font-bold text-white border border-[#1d1d1d] z-10`}>
                {level}
            </div>
        </div>
    );
}