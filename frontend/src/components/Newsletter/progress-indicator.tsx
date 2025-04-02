"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  current: number;
  total: number;
  className?: string;
  variant?: "waitlist" | "default";
  showAnimation?: boolean;
  labelPosition?: "sides" | "above" | "none";
  size?: "sm" | "md" | "lg";
}

export function ProgressIndicator({
  current,
  total,
  className,
  variant = "default",
  showAnimation = true,
  labelPosition = "sides",
  size = "md",
}: ProgressIndicatorProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  
  // Calcula plazas restantes
  const remaining = Math.max(0, total - current);
  
  // Configuración basada en el tamaño
  const heightClass = size === "sm" 
    ? "h-1.5" 
    : size === "md" 
      ? "h-2" 
      : "h-3";
  
  const textSizeClass = size === "sm" 
    ? "text-xs" 
    : size === "md" 
      ? "text-sm" 
      : "text-base";

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        setAnimatedPercentage(percentage);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setAnimatedPercentage(percentage);
    }
  }, [percentage, showAnimation]);

  return (
    <div className={cn("w-full", className)}>
      {/* Etiquetas superiores */}
      {labelPosition === "above" && (
        <div className={cn("flex justify-between mb-1.5", textSizeClass)}>
          <span className="text-white/70">0</span>
          <span className="font-medium text-white/80">
            {variant === "waitlist" ? "Plazas reservadas" : "Progreso"}
          </span>
          <span className="text-white/70">{total}</span>
        </div>
      )}
      
      {/* Etiquetas laterales */}
      {labelPosition === "sides" && (
        <div className={cn("flex justify-between mb-1.5", textSizeClass)}>
          <span className="text-[#C9A880]">0</span>
          <span className="font-medium text-[#C9A880]">
            {variant === "waitlist" ? "Plazas reservadas" : "Progreso"}
          </span>
          <span className="text-[#C9A880]">{total}</span>
        </div>
      )}
      
      {/* Barra de progreso con efectos visuales */}
      <div className={cn("w-full bg-[#191613] rounded-full overflow-hidden", heightClass)}>
        <motion.div 
          className={`h-full ${
            variant === "waitlist" 
              ? "bg-gradient-to-r from-[#C9A880] to-[#A78355]" 
              : "bg-[#C9A880]"
          }`}
          initial={{ width: "0%" }}
          animate={{ width: `${animatedPercentage}%` }}
          transition={{ duration: showAnimation ? 1.5 : 0, ease: "easeOut" }}
        />
      </div>
      
      {/* Información detallada */}
      <div className={cn("flex justify-between mt-2", textSizeClass)}>
        <div className="text-white/70">
          <span className="font-bold text-[#C9A880]">{current}</span>
          {variant === "waitlist" ? " reservas" : " completado"}
        </div>
        
        <div className="text-white/70">
          {variant === "waitlist" 
            ? (
              <>
                <span className="font-bold text-[#C9A880]">
                  {remaining}
                </span> plazas disponibles
              </>
            ) 
            : (
              <>
                <span className="font-bold text-[#C9A880]">
                  {percentage.toFixed(0)}%
                </span> completo
              </>
            )
          }
        </div>
      </div>
    </div>
  );
}
