import React from 'react';

import { Post } from '@/types/Post';

import { PostCard } from './PostCard';

interface PostFeedProps {
    posts: Post[];
    filter?: string;
    onPostClick: (postId: string) => void;
}

export const PostFeed: React.FC<PostFeedProps> = ({ posts, filter = 'all', onPostClick }) => {
    // Filtrar posts según la categoría seleccionada
    const filteredPosts = filter === 'all'
        ? posts
        : posts.filter(post => post.categoryId === filter);

    return (
        <div className="space-y-4 mx-4 sm:mx-2 md:mx-0">
            {filteredPosts.map((post) => (
                <PostCard
                    key={post.id}
                    id={post.id}
                    author={post.author}
                    timestamp={post.timestamp}
                    category={post.category}
                    content={post.content}
                    likes={post.likes}
                    comments={post.comments}
                    imageUrl={post.imageUrl}
                    onPostClick={onPostClick}
                />
            ))}
        </div>
    );
};