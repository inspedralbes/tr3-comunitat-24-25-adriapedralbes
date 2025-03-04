"use client";

import { MessageSquare, Clock, Calendar, MapPin } from "lucide-react";
import { UserAvatar } from "@/components/Members/UserAvatar";

interface MemberCardProps {
    member: {
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
    };
}

export function MemberCard({ member }: MemberCardProps) {
    return (
        <div className="py-6 px-4 border-b border-gray-700/50">
            <div className="flex">
                {/* Avatar con nivel superpuesto */}
                <div className="mr-4">
                    <UserAvatar
                        username={member.username}
                        avatarUrl={member.avatarUrl}
                        level={member.level}
                        size="lg"
                    />
                </div>

                {/* Contenido principal */}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-white text-lg">{member.username}</h3>
                            <p className="text-gray-400 text-sm">{member.handle}</p>
                            <p className="text-white mt-2">{member.description}</p>
                        </div>

                        <button className="flex items-center justify-center px-4 py-1 text-gray-300 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded border border-gray-700 transition-colors text-sm">
                            <MessageSquare size={16} className="mr-1" />
                            CHAT
                        </button>
                    </div>

                    {/* Meta información */}
                    <div className="mt-3 text-sm text-gray-400 space-y-2">
                        {member.isOnline ? (
                            <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                <span>Online now</span>
                            </div>
                        ) : member.lastActive && (
                            <div className="flex items-center">
                                <Clock size={14} className="mr-2" />
                                <span>Active {member.lastActive}</span>
                            </div>
                        )}

                        <div className="flex items-center">
                            <Calendar size={14} className="mr-2" />
                            <span>Joined {member.joinedDate}</span>
                        </div>

                        {member.location && (
                            <div className="flex items-center">
                                <MapPin size={14} className="mr-2" />
                                <span>{member.location}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}