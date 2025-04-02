"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { AvatarCircles } from "@/components/magicui/avatar-circles";
import { ProgressIndicator } from "@/components/Newsletter/progress-indicator";
import { cn } from "@/lib/utils";

// Avatares predefinidos - Mejor lista con más variedad
const avatars = [
    {
        imageUrl: "https://randomuser.me/api/portraits/women/33.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/men/54.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/women/29.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/men/42.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/women/77.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/men/12.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/women/45.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/men/28.jpg",
        profileUrl: "#",
    },
];

interface NewsletterAvatarCirclesProps {
  className?: string;
  totalPlazas?: number;
  plazasOcupadas?: number;
  avatarsToShow?: number;
}

export function NewsletterAvatarCircles({
  className,
  totalPlazas = 200,
  plazasOcupadas = 133,
  avatarsToShow = 6,
}: NewsletterAvatarCirclesProps) {
    const [visibleAvatars] = useState(avatars.slice(0, avatarsToShow));

    // Función para crear avatares con efecto de animación
    const avatarsWithAnimation = () => (
        <AvatarCircles 
            numPeople={plazasOcupadas - visibleAvatars.length} 
            avatarUrls={visibleAvatars} 
            className={cn("transform transition-all duration-300 hover:scale-105", className)}
        />
    );

    return (
        <div className={cn("flex flex-col items-center space-y-3", className)}>
            {/* Avatares con efecto de hover */}
            {avatarsWithAnimation()}
            
            {/* Barra de progreso mejorada */}
            <div className="w-full max-w-sm">
                <ProgressIndicator 
                    current={plazasOcupadas}
                    total={totalPlazas}
                    variant="waitlist"
                    size="md"
                    showAnimation={true}
                    labelPosition="sides"
                />
            </div>
        </div>
    );
}
