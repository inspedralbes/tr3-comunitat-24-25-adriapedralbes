"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

interface Avatar {
  imageUrl: string;
  profileUrl: string;
}
interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: Avatar[];
  onMoreClick?: () => void;
}

export const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
  onMoreClick
}: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url, index) => (
        <a
          key={index}
          href={url.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            key={index}
            src={url.imageUrl}
            alt={`Avatar ${index + 1}`}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800 object-cover"
          />
        </a>
      ))}
      {(numPeople ?? 0) > 0 && (
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black"
          onClick={onMoreClick}
          aria-label={`Ver ${numPeople} perfiles más`}
        >
          +{numPeople}
        </button>
      )}
    </div>
  );
};
