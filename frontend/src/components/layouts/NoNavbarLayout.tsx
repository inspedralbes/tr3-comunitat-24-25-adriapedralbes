"use client";

import React, { ReactNode } from 'react';

interface NoNavbarLayoutProps {
    children: ReactNode;
}

export default function NoNavbarLayout({ children }: NoNavbarLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen bg-[#1F1F1E] text-white">
            {/* Sin barra de navegación */}
            
            {/* Contenido principal */}
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}