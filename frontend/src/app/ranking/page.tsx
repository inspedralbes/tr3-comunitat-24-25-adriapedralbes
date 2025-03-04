'use client';

import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { ProfileLevelComponent } from '@/components/Ranking/ProfileLevelComponent';
import { LeaderboardTable } from '@/components/Ranking/LeaderboardTable';
import { weeklyUsers, monthlyUsers, allTimeUsers, userProfile } from '@/mockData/leaderboardsData';

export default function RankingPage() {
    return (
        <MainLayout activeTab="ranking">
            <div className="container max-w-6xl mx-auto px-4 py-8 mt-16">
                {/* Componente de perfil con nivel */}
                <ProfileLevelComponent
                    username={userProfile.username}
                    level={userProfile.level}
                    avatarUrl={userProfile.avatarUrl}
                    pointsToNextLevel={userProfile.pointsToNextLevel}
                />

                {/* Última actualización */}
                <div className="text-xs text-gray-500 mt-4 mb-6">
                    Last updated: Mar 3rd 2025 9:38am
                </div>

                {/* Grid de leaderboards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <LeaderboardTable title="Leaderboard (7-day)" users={weeklyUsers} />
                    <LeaderboardTable title="Leaderboard (30-day)" users={monthlyUsers} />
                    <LeaderboardTable title="Leaderboard (all-time)" users={allTimeUsers} />
                </div>
            </div>
        </MainLayout>
    );
}