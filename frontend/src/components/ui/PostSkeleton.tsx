import React from 'react';

interface PostSkeletonProps {
  count?: number;
  withImage?: boolean;
}

export const PostSkeleton: React.FC<PostSkeletonProps> = ({ 
  count = 3,
  withImage = true 
}) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div 
          key={index} 
          className="bg-[#323230] rounded-lg p-4 border border-white/10 min-h-post skeleton-pulse mb-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-full bg-zinc-700 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-zinc-700 rounded w-1/4"></div>
              <div className="h-3 bg-zinc-700/60 rounded w-1/6"></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="h-5 bg-zinc-700 rounded w-3/4"></div>
            <div className="h-4 bg-zinc-700/80 rounded w-full"></div>
            <div className="h-4 bg-zinc-700/80 rounded w-2/3"></div>
          </div>
          
          {withImage && index % 2 === 0 && (
            <div className="my-3 h-24 bg-zinc-700/60 rounded-lg w-full"></div>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className="h-6 bg-zinc-700 rounded w-12"></div>
              <div className="h-6 bg-zinc-700 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default PostSkeleton;