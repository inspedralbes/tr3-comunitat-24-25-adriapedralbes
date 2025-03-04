export interface Comment {
    id: string;
    author: {
        username: string;
        level?: number;
        avatarUrl?: string;
    };
    content: string;
    timestamp: string;
    likes: number;
    replies?: Comment[];
    mentionedUser?: string;
}