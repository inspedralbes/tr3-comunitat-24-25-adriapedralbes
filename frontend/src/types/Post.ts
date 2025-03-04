export interface Post {
    id: string;
    author: {
        username: string;
        level?: number;
        avatarUrl?: string;
    };
    timestamp: string;
    category?: string;
    categoryId?: string;
    content: string;
    likes: number;
    comments: number;
    isPinned?: boolean;
    imageUrl?: string;
}