export interface Post {
    id: string;
    author: {
        id?: string;
        username: string;
        level?: number;
        avatar_url?: string; // Desde la API
        avatarUrl?: string; // Normalizado
    };
    // Propiedades de la API
    title?: string; // Título del post
    category?: string | { id: string; name: string; color?: string; }; // Puede ser string u objeto
    created_at?: string;
    updated_at?: string;
    image?: string;
    comments_count?: number;
    is_pinned?: boolean;
    
    // Propiedades normalizadas para la interfaz
    timestamp?: string;
    categoryId?: string;
    content: string;
    likes: number;
    comments?: number;
    isPinned?: boolean;
    imageUrl?: string;
}