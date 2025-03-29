export interface Comment {
    id: string;
    author?: {
        id?: string;       // ID del usuario (autor)
        username: string;
        level?: number;
        avatarUrl?: string;
        avatar_url?: string;
    };
    user?: {
        id?: string;       // ID del usuario (autor)
        username: string;
        level?: number;
        avatarUrl?: string;
        avatar_url?: string;
    };
    content: string;
    timestamp: string;
    likes: number;
    replies?: Comment[];
    mentionedUser?: string;
    is_liked?: boolean;
    created_at: string; // For API compatibility
    parent_id?: string;  // ID del comentario padre (para respuestas)
}