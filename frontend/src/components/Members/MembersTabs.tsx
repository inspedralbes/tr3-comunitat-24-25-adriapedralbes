"use client";

interface MembersTabsProps {
    counts: {
        all: number;
        admins: number;
        online: number;
    };
    activeFilter: "all" | "admins" | "online";
    onFilterChange: (filter: "all" | "admins" | "online") => void;
}

export function MembersTabs({ counts, activeFilter, onFilterChange }: MembersTabsProps) {
    const tabs = [
        { id: "all", label: `Members ${counts.all}` },
        { id: "admins", label: `Admins ${counts.admins}` },
        { id: "online", label: `Online ${counts.online}` }
    ];

    return (
        <div className="flex space-x-3">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onFilterChange(tab.id as "all" | "admins" | "online")}
                    className={`px-5 py-3 rounded-md text-sm font-medium transition-colors ${activeFilter === tab.id
                            ? "bg-[#2a2a2a] text-white"
                            : "bg-[#222222] text-gray-400 hover:text-gray-300"
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}