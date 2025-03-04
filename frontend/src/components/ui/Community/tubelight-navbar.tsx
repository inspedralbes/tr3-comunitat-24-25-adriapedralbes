"use client";

import { motion } from "framer-motion";
import { LucideIcon, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";

import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
  active?: boolean;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  // Encuentra el ítem activo por la propiedad 'active' en lugar de mantener estado local
  const activeItem = items.find(item => item.active) || items[0];
  const [isMobile, setIsMobile] = useState(false);

  // Estado para nuestro menú desplegable personalizado
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Manejar clics fuera del dropdown para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Añadir useEffect para manejar el scroll
  useEffect(() => {
    // Forzar overflow-y: scroll en el HTML para evitar saltos
    document.documentElement.style.overflowY = 'scroll';

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 left-1/2 -translate-x-1/2 z-50 sm:pt-6 w-[calc(100%-32px)] sm:w-[calc(100%-16px)] md:w-auto will-change-transform",
        className,
      )}
      style={{ transform: 'translateX(-50%)', transition: 'none' }}
    >
      <div className="relative flex items-center justify-around sm:justify-start sm:gap-3 bg-[#1f1f1e]/80 border border-white/10 backdrop-blur-lg py-1 px-1 sm:px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.name}
              href={item.url}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-3 sm:px-4 md:px-6 py-2 rounded-full transition-colors",
                isActive
                  ? "bg-[#323230]/80 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-[#323230]/80 rounded-full -z-10"
                  initial={false}
                  animate={{ opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                  }}
                >
                  {/* Glow effect on active tab - mantiene la misma configuración */}
                  <motion.div
                    className="absolute -top-2 left-0 right-0 mx-auto w-8 h-1 bg-white rounded-t-full"
                    layoutId="glow"
                    animate={{
                      boxShadow: [
                        "0 0 5px 2px rgba(255, 255, 255, 0.3)",
                        "0 0 15px 5px rgba(255, 255, 255, 0.5)",
                        "0 0 5px 2px rgba(255, 255, 255, 0.3)",
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      layout: {
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      },
                    }}
                  >
                    <div className="absolute w-12 h-6 bg-white/30 rounded-full blur-md -top-2 left-1/2 -translate-x-1/2" />
                    <div className="absolute w-8 h-6 bg-white/40 rounded-full blur-md -top-1 left-1/2 -translate-x-1/2" />
                    <div className="absolute w-4 h-4 bg-white/50 rounded-full blur-sm top-0 left-1/2 -translate-x-1/2" />
                  </motion.div>
                </motion.div>
              )}
            </Link>
          );
        })}

        {/* Menú desplegable personalizado */}
        <div className="ml-0 sm:ml-2 relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center overflow-hidden rounded-full w-10 h-10 hover:ring-2 hover:ring-white/30 transition-all bg-[#323230] border border-white/10"
          >
            <img
              src="https://github.com/shadcn.png"
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Menú desplegable personalizado */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg shadow-lg bg-[#1d1d1b] border border-white/10 text-white z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <p className="font-semibold text-white">Mi Cuenta</p>
              </div>

              <div className="py-1">
                <button
                  className="flex items-center w-full px-4 py-2 text-zinc-200 hover:bg-[#323230] hover:text-white transition-colors"
                  onClick={() => {
                    // Acción para Perfil
                    setIsDropdownOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </button>

                <button
                  className="flex items-center w-full px-4 py-2 text-zinc-200 hover:bg-[#323230] hover:text-white transition-colors"
                  onClick={() => {
                    // Acción para Configuración
                    setIsDropdownOpen(false);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </button>
              </div>

              <div className="border-t border-white/10 py-1">
                <button
                  className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
                  onClick={() => {
                    // Acción para Cerrar sesión
                    setIsDropdownOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}