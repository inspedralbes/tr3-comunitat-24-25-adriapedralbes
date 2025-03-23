"use client";

import { Lock, BookOpen } from "lucide-react";
import SafeImage from '../ui/safe-image';
import ProgressIndicator from './ProgressIndicator';
import React, { useEffect, useState } from 'react';
import useUserProgress from '@/hooks/useUserProgress';

interface CourseCardProps {
    title: string;
    description?: string;
    imageUrl: string;
    progress: number;
    lessonsCount?: number;
    isPrivate: boolean;
    onClick?: () => void;
    id?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
    title,
    description,
    imageUrl,
    progress,
    lessonsCount = 0, // Cambiar valor por defecto a 0
    isPrivate,
    onClick,
    id
}) => {
    // Usando el hook para obtener el progreso real
    const { progressPercentage, loading } = useUserProgress(id);
    
    // Estado local para manejar el progreso que mostraremos
    const [displayProgress, setDisplayProgress] = useState(progress || 0);
    
    // Actualizar el progreso cuando cambian los datos
    useEffect(() => {
        if (!loading && id && progressPercentage !== undefined) {
            setDisplayProgress(progressPercentage);
        } else {
            setDisplayProgress(progress || 0);
        }
    }, [progress, progressPercentage, loading, id]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onClick) {
                onClick();
            }
        }
    };

    return (
        <div
            className="bg-[#323230] rounded-lg overflow-hidden hover:opacity-95 hover:shadow-lg hover:shadow-white/5 transition-all cursor-pointer border border-white/10"
            onClick={onClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Course: ${title}`}
        >
            <div className="relative h-40">
                <SafeImage
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    unoptimized={true}
                />
                {isPrivate && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                        <Lock className="text-white mb-2" size={24} />
                        <span className="text-white font-medium">Private Course</span>
                    </div>
                )}
            </div>
            <div className="p-4 bg-[#323230]">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-medium">{title}</h3>
                    <span className="flex items-center text-xs text-zinc-400 gap-1">
                        <BookOpen size={14} />
                        <span>{lessonsCount} lecciones</span>
                    </span>
                </div>
                {description && (
                    <p className="text-zinc-300 text-sm mb-4 line-clamp-2">{description}</p>
                )}
                <ProgressIndicator 
                    progress={displayProgress}
                    lessonsCount={lessonsCount}
                    completedLessons={Math.round((displayProgress) * lessonsCount / 100)} // Estimación basada en el progreso
                    variant="compact"
                />
            </div>
        </div>
    );
};