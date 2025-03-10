export interface LeaderboardUser {
    position: number;
    username: string;
    avatarUrl: string;
    points: number;
}

export const topUsers: LeaderboardUser[] = [
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