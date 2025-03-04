import { Trophy } from 'lucide-react';
import React, { useState } from 'react';

import { Post } from '@/types/Post';

import { PostCard } from './PostCard';

interface PinnedPostsSectionProps {
    pinnedPosts: Post[];
    onPostClick: (postId: string) => void;
}

export const PinnedPostsSection: React.FC<PinnedPostsSectionProps> = ({ pinnedPosts, onPostClick }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible || pinnedPosts.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 mx-4 sm:mx-2 md:mx-0">
            <div className="bg-amber-800/30 rounded-t-lg px-4 py-2 flex items-center justify-between border-l-4 border-amber-500 border-t border-r border-white/10">
                <div className="flex items-center gap-2 text-amber-400">
                    <Trophy size={16} />
                    <span className="font-medium">Pinned</span>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-sm font-medium text-amber-400 hover:text-amber-300"
                >
                    Hide
                </button>
            </div>
            <div className="bg-transparent">
                {pinnedPosts.map((post) => (
                    <PostCard
                        key={post.id}
                        id={post.id}
                        author={post.author}
                        timestamp={post.timestamp}
                        category={post.category}
                        content={post.content}
                        likes={post.likes}
                        comments={post.comments}
                        isPinned={true}
                        imageUrl={post.imageUrl}
                        onPostClick={onPostClick}
                    />
                ))}
            </div>
        </div>
    );
};