import { Comment } from "@/types/Comment";

// Comentarios para el post de presentación (post1)
export const presentationComments: Comment[] = [
    {
        id: "comment1",
        author: {
            username: "Patricia Juane",
            level: 4,
            avatarUrl: "/avatars/patricia.jpg"
        },
        content: "Hola Jose, muchas gracias por tu comentario. Es un placer tener a gente como tú dentro de esta comunidad. ¡Un fuerte abrazo! P.D.: ¿En qué sitios has estado de viaje?",
        timestamp: "12d",
        likes: 1,
        replies: [
            {
                id: "reply1",
                author: {
                    username: "Jose Perezlindo",
                    level: 2,
                    avatarUrl: "/avatars/jose.jpg"
                },
                content: "Gracias a ti por dar estas clases de ayuda y crear comunidades. En respuesta a tu pregunta, estuve dos años viviendo en Nueva Zelanda. Conociendo su cultura, su maravillosa gente y aprendiendo su idioma.",
                timestamp: "12d",
                likes: 1,
                mentionedUser: "Patricia Juane"
            }
        ]
    }
];

// Comentarios para la pregunta sobre módulo 3 (post2)
export const questionComments: Comment[] = [
    {
        id: "comment1",
        author: {
            username: "María López",
            level: 3,
            avatarUrl: "/avatars/maria.jpg"
        },
        content: "Hola Javier, yo también tuve ese problema. El error suele ocurrir cuando los parámetros no están bien formateados. ¿Podrías compartir el código que estás usando?",
        timestamp: "3d",
        likes: 2
    },
    {
        id: "comment2",
        author: {
            username: "Carlos Mendoza",
            level: 5,
            avatarUrl: "/avatars/carlos.jpg"
        },
        content: "Revisa la documentación en la página 42, hay un ejemplo muy similar a lo que necesitas implementar. La función calculateMetrics() necesita recibir un objeto con la estructura correcta.",
        timestamp: "2d",
        likes: 3
    }
];

// Mapeo de IDs de posts a sus comentarios
export const commentsByPostId: Record<string, Comment[]> = {
    "post1": presentationComments,
    "post2": questionComments,
    // Puedes agregar más posts aquí
};