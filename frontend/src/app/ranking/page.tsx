'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import MainLayout from '@/components/layouts/MainLayout';
import { LeaderboardTable, LeaderboardUser } from '@/components/Ranking/LeaderboardTable';
import { ProfileLevelComponent } from '@/components/Ranking/ProfileLevelComponent';
import { authService } from '@/services/auth';
import { rankingService } from '@/services/ranking';
import subscriptionService from '@/services/subscription';

export default function RankingPage() {
    const router = useRouter();
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

    // Verificar autenticación y suscripción
    useEffect(() => {
        // Función para verificar autenticación y suscripción al cargar la página
        const checkAuth = async () => {
            setLoading(true);
            
            // Verificar si está autenticado
            if (!authService.isAuthenticated()) {
                router.push('/perfil');
                return;
            }
            
            try {
                // Verificar suscripción
                const subscriptionStatus = await subscriptionService.getSubscriptionStatus().catch(error => {
                    console.error('Error al verificar suscripción:', error);
                    // En caso de error, permitimos acceso temporal
                    return { has_subscription: true, subscription_status: 'temp_access', start_date: null, end_date: null };
                });
                
                console.warn('Estado de suscripción:', subscriptionStatus);
                
                // Si no tiene suscripción, redirigir a la página de perfil
                if (!subscriptionStatus.has_subscription) {
                    console.warn('Usuario sin suscripción, redirigiendo al perfil');
                    router.push('/perfil');
                    return;
                }
                
                // Continuar con la carga de datos
                fetchData();
            } catch (error) {
                console.error('Error general al verificar acceso:', error);
                setLoading(false);
            }
        };
        
        checkAuth();
    }, [router]);

    // Función para cargar los datos
    const fetchData = async () => {
        try {
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