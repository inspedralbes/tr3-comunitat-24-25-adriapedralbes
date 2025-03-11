import { LeaderboardUser } from '@/components/Ranking/LeaderboardTable';

// Usuarios para el leaderboard de 7 días
export const weeklyUsers: LeaderboardUser[] = [
    {
        position: 1,
        username: 'Jose Perezlindo',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 4
    },
    {
        position: 2,
        username: 'Javier Robles',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 3
    },
    {
        position: 3,
        username: 'Diego Santiago',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 2
    },
    {
        position: 4,
        username: 'Hernan Agudelo',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 2
    },
    {
        position: 5,
        username: 'Luis Z',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 1
    }
];

// Usuarios para el leaderboard de 30 días
export const monthlyUsers: LeaderboardUser[] = [
    {
        position: 1,
        username: 'Diego Santiago',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 11
    },
    {
        position: 2,
        username: 'Jose Perezlindo',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 9
    },
    {
        position: 3,
        username: 'Hernan Agudelo',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 6
    },
    {
        position: 4,
        username: 'Alejandro Díaz',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 6
    },
    {
        position: 5,
        username: 'Luis Z',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 4
    }
];

// Usuarios para el leaderboard de todos los tiempos
export const allTimeUsers: LeaderboardUser[] = [
    {
        position: 1,
        username: 'Diego Santiago',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 11
    },
    {
        position: 2,
        username: 'Jose Perezlindo',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 9
    },
    {
        position: 3,
        username: 'Alejandro Díaz',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 6
    },
    {
        position: 4,
        username: 'Hernan Agudelo',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 6
    },
    {
        position: 5,
        username: 'Luis Z',
        avatarUrl: 'https://github.com/shadcn.png',
        points: 4
    }
];

// Datos del perfil del usuario actual
export const userProfile = {
    username: 'Ad EstMarq',
    level: 1,
    avatarUrl: 'https://github.com/shadcn.png',
    pointsToNextLevel: 2,
};