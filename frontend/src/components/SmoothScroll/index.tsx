"use client";

import React, { ReactNode } from 'react';

interface SmoothScrollLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export const SmoothScrollLink: React.FC<SmoothScrollLinkProps> = ({ 
  href, 
  children,
  className = ""
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Verifica si el enlace es un ancla
    if (href.startsWith('#')) {
      e.preventDefault();
      
      // Obtiene el elemento objetivo mediante el ID
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      
      if (element) {
        // Calcula la posición del elemento
        const offset = element.getBoundingClientRect().top + window.scrollY;
        
        // Realiza el scroll suave
        window.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
        
        // Actualiza la URL sin causar un salto
        window.history.pushState(null, '', href);
      }
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};
