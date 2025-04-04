export interface User {
  id: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
  bio?: string | null;
  level: number;
  points: number;
  website?: string | null;
  position?: number | null;
  is_premium?: boolean;
  created_at?: string;
  updated_at?: string;
  posts_count?: number;
  likes_received?: number;
  comments_count?: number;
}