import React from 'react';
import { LockIcon } from 'lucide-react';

interface ProfileLevelComponentProps {
    username: string;
    level: number;
    avatarUrl: string;
    pointsToNextLevel: number;
}

export const ProfileLevelComponent: React.FC<ProfileLevelComponentProps> = ({
    username,
    level,
    avatarUrl,
    pointsToNextLevel,
}) => {
    return (
        <div className="bg-[#323230]/90 rounded-lg border border-white/10 p-8">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
                {/* Avatar con nivel */}
                <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-600">
                        <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 right-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white border-4 border-[#1F1F1E]">
                        {level}
                    </div>
                </div>

                {/* Información del usuario */}
                <div className="flex flex-col items-center md:items-start">
                    <h1 className="text-2xl font-bold text-white">{username}</h1>
                    <div className="text-center md:text-left mt-2 mb-4">
                        <div className="text-white font-medium">Level {level}</div>
                        <div className="text-sm text-gray-400">{pointsToNextLevel} points to level up <span className="inline-block ml-1">ⓘ</span></div>
                    </div>
                </div>
            </div>

            {/* Grid de niveles */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                {/* Nivel 1 - Activo */}
                <LevelBlock level={1} isUnlocked={true} percentage={93} isActive={level === 1} />

                {/* Nivel 2 - Bloqueado */}
                <LevelBlock level={2} isUnlocked={false} percentage={6} isActive={level === 2} />

                {/* Nivel 3 - Bloqueado */}
                <LevelBlock level={3} isUnlocked={false} percentage={0} isActive={level === 3} />

                {/* Nivel 4 - Bloqueado */}
                <LevelBlock level={4} isUnlocked={false} percentage={1} isActive={level === 4} />

                {/* Nivel 5 - Bloqueado */}
                <LevelBlock level={5} isUnlocked={false} percentage={0} isActive={level === 5} />

                {/* Nivel 6 - Bloqueado */}
                <LevelBlock level={6} isUnlocked={false} percentage={0} isActive={level === 6} />

                {/* Nivel 7 - Bloqueado */}
                <LevelBlock level={7} isUnlocked={false} percentage={0} isActive={level === 7} />

                {/* Nivel 8 - Bloqueado */}
                <LevelBlock level={8} isUnlocked={false} percentage={0} isActive={level === 8} />

                {/* Nivel 9 - Bloqueado */}
                <LevelBlock level={9} isUnlocked={false} percentage={0} isActive={level === 9} />
            </div>
        </div>
    );
};

interface LevelBlockProps {
    level: number;
    isUnlocked: boolean;
    isActive: boolean;
    percentage: number;
}

const LevelBlock: React.FC<LevelBlockProps> = ({ level, isUnlocked, isActive, percentage }) => {
    return (
        <div className={`relative flex items-center p-3 rounded-lg ${isActive ? 'bg-blue-900/20' : 'bg-[#2A2A28]'}`}>
            {isUnlocked ? (
                <div className="flex items-center w-full">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isActive ? 'bg-blue-600' : 'bg-blue-700'} text-white font-bold mr-3`}>
                        {level}
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-white">Level {level}</div>
                        <div className="text-xs text-gray-400">{percentage}% of members</div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center w-full">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-gray-400 mr-3">
                        <LockIcon size={14} />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-white">Level {level}</div>
                        <div className="text-xs text-gray-400">{percentage}% of members</div>
                    </div>
                </div>
            )}
        </div>
    );
};