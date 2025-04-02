"use client";

import { ReactNode } from "react";

import { AnimatedButton } from "@/components/animatedButton";
import { RainbowButtonDemo } from "@/components/rainbowButton";

interface ScrollTopButtonProps {
  children: ReactNode;
  type?: "animated" | "rainbow";
  isSubscribeButton?: boolean;
}

export function ScrollTopButton({
  children,
  type = "animated",
  isSubscribeButton = false
}: ScrollTopButtonProps) {

  const handleClick = () => {
    if (!isSubscribeButton) {
      // Scroll al inicio de la página con animación suave
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
    // Si es el botón de suscripción, no hacemos nada especial
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isSubscribeButton) {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    }
  };

  if (type === "rainbow") {
    return (
      <div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={isSubscribeButton ? "Suscribirse" : "Volver arriba"}
      >
        <RainbowButtonDemo>
          {children}
        </RainbowButtonDemo>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={isSubscribeButton ? "Suscribirse" : "Volver arriba"}
    >
      <AnimatedButton>
        {children}
      </AnimatedButton>
    </div>
  );
}
