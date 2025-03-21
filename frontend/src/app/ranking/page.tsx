'use client';

import React, { useEffect, useState } from 'react';

import MainLayout from '@/components/layouts/MainLayout';
import { LeaderboardTable, LeaderboardUser } from '@/components/Ranking/LeaderboardTable';
import { ProfileLevelComponent } from '@/components/Ranking/ProfileLevelComponent';
import { rankingService } from '@/services/ranking';

export default function RankingPage() {
    // Estados para almacenar los datos de los leaderboards
    const [weeklyUsers, setWeeklyUsers] = useState<LeaderboardUser[]>([]);
    const [monthlyUsers, setMonthlyUsers] = useState<LeaderboardUser[]>([]);
    const [allTimeUsers, setAllTimeUsers] = useState<LeaderboardUser[]>([]);
    const [userProfile, setUserProfile] = useState({
        username: '',
        level: 1,
        avatarUrl: '',
        pointsToNextLevel: 0
    });
    const [lastUpdated, setLastUpdated] = useState('');
    const [loading, setLoading] = useState(true);

    // Efecto para cargar los datos cuando el componente se monta
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Cargar datos de los leaderboards
                const [weekly, monthly, allTime] = await Promise.all([
                    rankingService.getWeeklyLeaderboard(),
                    rankingService.getMonthlyLeaderboard(),
                    rankingService.getAllTimeLeaderboard()
                ]);

                setWeeklyUsers(weekly);
                setMonthlyUsers(monthly);
                setAllTimeUsers(allTime);

                // Intentar cargar datos del usuario actual
                try {
                    const profileData = await rankingService.getCurrentUserProfile();
                    setUserProfile(profileData);
                } catch {
                    console.warn('No se pudo cargar el perfil del usuario');
                    // Si falla, mantener los valores por defecto
                }

                // Actualizar la fecha de última actualización
                setLastUpdated(new Date().toLocaleString());
            } catch (_err) {
                console.error('Error cargando datos de ranking:', _err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <MainLayout activeTab="ranking">
            <div className="container max-w-6xl mx-auto px-4 py-8 mt-16">
                {loading ? (
                    // Mostrar indicador de carga mientras se cargan los datos
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Componente de perfil con nivel */}
                        <ProfileLevelComponent
                            username={userProfile.username}
                            level={userProfile.level}
                            avatarUrl={userProfile.avatarUrl}
                            pointsToNextLevel={userProfile.pointsToNextLevel}
                        />

                        {/* Última actualización */}
                        <div className="text-xs text-gray-500 mt-4 mb-6">
                            Last updated: {lastUpdated}
                        </div>

                        {/* Grid de leaderboards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <LeaderboardTable title="Leaderboard (7-day)" users={weeklyUsers} />
                            <LeaderboardTable title="Leaderboard (30-day)" users={monthlyUsers} />
                            <LeaderboardTable title="Leaderboard (all-time)" users={allTimeUsers} />
                        </div>
                    </>
                )}
            </div>
        </MainLayout>
    );
}