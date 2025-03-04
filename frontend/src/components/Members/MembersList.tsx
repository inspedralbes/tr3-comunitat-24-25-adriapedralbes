"use client";

import { MemberCard } from "./MemberCard";

interface MembersListProps {
    members: Array<{
        id: string;
        username: string;
        handle: string;
        avatarUrl: string;
        level: number;
        description: string;
        isOnline: boolean;
        lastActive: string | null;
        joinedDate: string;
        location: string | null;
    }>;
}

export function MembersList({ members }: MembersListProps) {
    if (members.length === 0) {
        return (
            <div className="bg-[#1d1d1d] rounded-lg p-6 text-center">
                <p className="text-gray-400">No hay miembros que mostrar con este filtro.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#1d1d1d] rounded-lg overflow-hidden">
            {members.map((member, index) => (
                <MemberCard key={member.id} member={member} />
            ))}
        </div>
    );
}