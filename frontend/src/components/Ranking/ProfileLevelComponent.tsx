import { LockIcon, Loader2Icon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { LevelDistribution, rankingService } from '@/services/ranking';
import { UserLargeAvatar } from './UserLargeAvatar';

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
    const [levelDistribution, setLevelDistribution] = useState<LevelDistribution[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchLevelDistribution = async () => {
            try {
                setLoading(true);
                const data = await rankingService.getLevelDistribution();
                setLevelDistribution(data);
            } catch (error) {
                console.error('Error al obtener distribución de niveles:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchLevelDistribution();
    }, []);
    return (
        <div className="bg-[#323230]/90 rounded-lg border border-white/10 p-8">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
                <UserLargeAvatar 
                    username={username} 
                    avatarUrl={avatarUrl} 
                    level={level} 
                />

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
                {loading ? (
                    <div className="col-span-5 flex justify-center items-center py-8">
                        <Loader2Icon className="animate-spin h-8 w-8 text-blue-500" />
                    </div>
                ) : (
                    levelDistribution.length > 0 ? (
                        // Mostrar niveles con datos reales
                        levelDistribution.map((levelData) => (
                            <LevelBlock 
                                key={levelData.level}
                                level={levelData.level} 
                                isUnlocked={level >= levelData.level} 
                                percentage={levelData.percentage} 
                                isActive={level === levelData.level} 
                            />
                        ))
                    ) : (
                        // Fallback por si no hay datos
                        Array.from({ length: 9 }, (_, i) => i + 1).map((levelNum) => (
                            <LevelBlock 
                                key={levelNum}
                                level={levelNum} 
                                isUnlocked={level >= levelNum} 
                                percentage={0} 
                                isActive={level === levelNum} 
                            />
                        ))
                    )
                )}
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