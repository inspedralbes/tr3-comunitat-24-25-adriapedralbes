/**
 * Interfaz para rastrear cuándo un usuario vio por última vez un post
 */
export interface PostView {
    postId: string;
    lastViewedAt: string; // Timestamp de la última vez que el usuario vio el post
}

/**
 * Tipo para un registro de vistas de posts
 */
export type PostViewRecord = Record<string, string>;