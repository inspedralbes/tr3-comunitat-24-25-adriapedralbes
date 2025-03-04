import React from 'react';
import Image from 'next/image';
import { Lock } from "lucide-react";

interface CourseCardProps {
    title: string;
    description?: string;
    imageUrl: string;
    progress: number;
    isPrivate: boolean;
    onClick?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
    title,
    description,
    imageUrl,
    progress,
    isPrivate,
    onClick
}) => {
    return (
        <div
            className="bg-[#323230] rounded-lg overflow-hidden hover:opacity-95 hover:shadow-lg hover:shadow-white/5 transition-all cursor-pointer border border-white/10"
            onClick={onClick}
        >
            <div className="relative h-40">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover"
                />
                {isPrivate && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                        <Lock className="text-white mb-2" size={24} />
                        <span className="text-white font-medium">Private Course</span>
                    </div>
                )}
            </div>
            <div className="p-4 bg-[#323230]">
                <h3 className="text-white font-medium mb-2">{title}</h3>
                {description && (
                    <p className="text-zinc-300 text-sm mb-4 line-clamp-2">{description}</p>
                )}
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#1F1F1E] rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className="text-zinc-400 text-xs">{progress}%</span>
                </div>
            </div>
        </div>
    );
};