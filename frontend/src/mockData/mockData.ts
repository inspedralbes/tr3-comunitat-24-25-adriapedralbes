// mockData.ts
export const mockPosts = [
    {
        id: 'pin1',
        author: {
            username: 'Patricia Juane',
            level: 4,
            avatarUrl: '/avatars/patricia.jpg'
        },
        timestamp: 'Sep \'24',
        category: 'General',
        categoryId: 'general',
        content: 'Bienvenid@ a la comunidad Premium!\n¡Hola! Te doy la bienvenida a la comunidad privada de DevAccelerator. Estamos felices de tenerte aquí, así que no dudes en escribir tu primer post de presentación para que todos te conozcan.',
        likes: 14,
        comments: 0,
        imageUrl: 'https://via.placeholder.com/150x100'
    },
    {
        id: 'post1',
        author: {
            username: 'Patricia Juane',
            level: 4,
            avatarUrl: '/avatars/patricia.jpg'
        },
        timestamp: '2d ago',
        category: 'Anuncios',
        categoryId: 'anuncios',
        content: 'Re: Workshop - Abrimos 2 plazas + Llamada de Estrategia desde...\nHola, team! 👋 En primer lugar, quiero dar las gracias a todos los asistentes del Workshop de ayer, The LinkedIn Blueprint™. Fue ESPECTACULAR poder compartir ese espacio con todos ustedes.',
        likes: 7,
        comments: 0,
        imageUrl: 'https://via.placeholder.com/150x200'
    },
    {
        id: 'post2',
        author: {
            username: 'Javier Robles',
            level: 1,
            avatarUrl: '/avatars/javier.jpg'
        },
        timestamp: '4d ago',
        category: 'Preguntas',
        categoryId: 'preguntas',
        content: 'Duda sobre el módulo 3\nEstoy trabajando en los ejercicios del módulo 3 y tengo una duda sobre la implementación de la función calculateMetrics(). ¿Alguien podría ayudarme con esto? He intentado seguir la documentación pero sigo recibiendo el mismo error.',
        likes: 3,
        comments: 5,
        imageUrl: ''
    },
    {
        id: 'post3',
        author: {
            username: 'María López',
            level: 2,
            avatarUrl: '/avatars/maria.jpg'
        },
        timestamp: '1w ago',
        category: 'Logros',
        categoryId: 'logros',
        content: '¡He completado el curso frontend!\nDespués de 6 semanas intensas, finalmente he completado el curso de frontend. Quería compartir mi proyecto final con todos ustedes y recibir feedback. ¡Gracias por todo el apoyo!',
        likes: 21,
        comments: 8,
        imageUrl: 'https://via.placeholder.com/200x150'
    }
];

export const pinnedPosts = [mockPosts[0]];
export const regularPosts = mockPosts.slice(1);