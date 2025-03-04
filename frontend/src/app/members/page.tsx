"use client";

import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { MembersTabs } from "@/components/Members/MembersTabs";
import { MembersList } from "@/components/Members/MembersList";

// Definición de tipo para un miembro
interface Member {
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
    isAdmin?: boolean;
}

// Datos mock de miembros basados en la imagen
const mockMembers: Member[] = [
    {
        id: "1",
        username: "Ad EstMarq",
        handle: "@adria-estevez-2586",
        avatarUrl: "https://github.com/shadcn.png",
        level: 1,
        description: "Trader Profesional de Memecoins y NFTs en Solana y Base.",
        isOnline: true,
        lastActive: null,
        joinedDate: "Feb 19, 2025",
        location: null,
        isAdmin: false
    },
    {
        id: "2",
        username: "Toni Dev",
        handle: "@toni-dev-7230",
        avatarUrl: "https://github.com/shadcn.png",
        level: 1,
        description: "Ingeniero de software, emprendedor y creador de contenido",
        isOnline: false,
        lastActive: "52m ago",
        joinedDate: "Feb 25, 2025",
        location: null,
        isAdmin: false
    },
    {
        id: "3",
        username: "Alejandro Blanco Mejias",
        handle: "@alejandro-blanco-mejias-4392",
        avatarUrl: "https://github.com/shadcn.png",
        level: 1,
        description: "Alejandro Blanco",
        isOnline: false,
        lastActive: "3h ago",
        joinedDate: "Feb 12, 2025",
        location: null,
        isAdmin: false
    },
    {
        id: "4",
        username: "Maria Aguilera",
        handle: "@maria-aguilera-8425",
        avatarUrl: "https://github.com/shadcn.png",
        level: 1,
        description: "SDET - Software Engineer",
        isOnline: false,
        lastActive: "3h ago",
        joinedDate: "Feb 10, 2025",
        location: "Cuenca, Ecuador",
        isAdmin: false
    },
    // Agregar un admin para que el filtro funcione
    {
        id: "5",
        username: "Patricia Juane",
        handle: "@patricia-juane",
        avatarUrl: "https://github.com/shadcn.png",
        level: 4,
        description: "Community Admin & Course Instructor",
        isOnline: false,
        lastActive: "1h ago",
        joinedDate: "Jan 15, 2025",
        location: "Madrid, España",
        isAdmin: true
    }
];

export default function MiembrosPage() {
    const [filter, setFilter] = useState<"all" | "admins" | "online">("all");

    // Filtrar miembros basado en el filtro activo
    const filteredMembers = mockMembers.filter(member => {
        if (filter === "admins") return member.isAdmin;
        if (filter === "online") return member.isOnline;
        return true;
    });

    // Contar miembros por categoría
    const counts = {
        all: mockMembers.length,
        admins: mockMembers.filter(m => m.isAdmin).length,
        online: mockMembers.filter(m => m.isOnline).length
    };

    return (
        <MainLayout activeTab="members">
            <div className="container mx-auto px-4 py-6">
                {/* Filtros y botón de invitación */}
                <div className="flex justify-between items-center mb-6">
                    <MembersTabs
                        counts={counts}
                        activeFilter={filter}
                        onFilterChange={setFilter}
                    />

                    <button className="px-6 py-2 bg-[#F3CA4D] hover:bg-[#e6be3e] text-black font-semibold rounded-md transition-colors">
                        INVITE
                    </button>
                </div>

                {/* Lista de miembros */}
                <MembersList members={filteredMembers} />
            </div>
        </MainLayout>
    );
}