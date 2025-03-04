import React from 'react';
import Image from 'next/image';
import { ThumbsUp, CornerUpRight } from 'lucide-react';

interface CommentData {
    id: string;
    username: string;
    avatarUrl?: string;
    level?: number;
    timestamp: string;
    content: string;
    likes: number;
}

interface PostCommentListProps {
    comments: CommentData[];
    onReply: (commentId: string, username: string) => void;
    onLike: (commentId: string) => void;
}

export const PostCommentList: React.FC<PostCommentListProps> = ({
    comments,
    onReply,
    onLike
}) => {
    return (
        <div className="mt-4 space-y-1">
            <h3 className="text-sm font-medium text-white mb-2">Comentarios ({comments.length})</h3>

            {comments.length > 0 ? (
                <div className="space-y-1">
                    {comments.map(comment => (
                        <div key={comment.id} className="border-b border-white/5 py-3">
                            <div className="flex gap-2">
                                {/* Avatar con nivel - CORREGIDO */}
                                <div className="relative flex-shrink-0 self-start">
                                    <div className="w-8 h-8 bg-[#444442] rounded-full overflow-hidden border border-white/10">
                                        {comment.avatarUrl ? (
                                            <Image
                                                src={comment.avatarUrl}
                                                alt={comment.username}
                                                width={32}
                                                height={32}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                {comment.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    {comment.level && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-zinc-900 z-10">
                                            {comment.level}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-white">{comment.username}</span>
                                        <span className="text-xs text-zinc-400">{comment.timestamp}</span>
                                    </div>

                                    <p className="text-zinc-200 text-sm mb-2">{comment.content}</p>

                                    <div className="flex items-center gap-4">
                                        <button
                                            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-300"
                                            onClick={() => onLike(comment.id)}
                                        >
                                            <ThumbsUp size={14} />
                                            {comment.likes > 0 && <span className="text-xs">{comment.likes}</span>}
                                        </button>

                                        <button
                                            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-300 text-xs"
                                            onClick={() => onReply(comment.id, comment.username)}
                                        >
                                            <CornerUpRight size={14} />
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-zinc-500 text-sm">
                    Aún no hay comentarios. ¡Sé el primero en comentar!
                </div>
            )}
        </div>
    );
};