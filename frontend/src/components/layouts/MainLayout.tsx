"use client";

import React, { ReactNode } from 'react';
import { NavBar } from "@/components/ui/Community/tubelight-navbar";
import { Users, GraduationCap, Calendar, User, Trophy, Info } from "lucide-react";

interface MainLayoutProps {
    children: ReactNode;
    activeTab: 'community' | 'classroom' | 'calendar' | 'members' | 'ranking' | 'about';
}

export default function MainLayout({ children, activeTab }: MainLayoutProps) {
    // Configuración de los items de navegación
    const navItems = [
        { name: "Comunidad", url: "/comunidad", icon: Users, active: activeTab === 'community' },
        { name: "Classroom", url: "/classroom", icon: GraduationCap, active: activeTab === 'classroom' },
        { name: "Calendario", url: "/calendar", icon: Calendar, active: activeTab === 'calendar' },
        { name: "Miembros", url: "/members", icon: User, active: activeTab === 'members' },
        { name: "Ranking", url: "/ranking", icon: Trophy, active: activeTab === 'ranking' },
        { name: "Acerca", url: "/about", icon: Info, active: activeTab === 'about' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#1F1F1E] text-white">
            {/* Barra de navegación en la parte superior */}
            <div className="w-full h-16 sm:h-20 mb-4">
                <NavBar items={navItems} />
            </div>

            {/* Separador horizontal debajo del navbar */}
            <div className="w-full border-b border-white/10"></div>

            {/* Contenido principal */}
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}