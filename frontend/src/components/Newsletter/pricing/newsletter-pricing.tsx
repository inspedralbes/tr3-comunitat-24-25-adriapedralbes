"use client";

import Link from "next/link";
import React from "react";

import { RainbowButtonDemo } from "@/components/rainbowButton";
import { SmoothScrollLink } from "@/components/SmoothScroll";

export function NewsletterPricing() {
  return (
    <section className="relative py-20 bg-[#080604] border-t border-[#C9A880]/15">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0806] to-[#050302] z-10"></div>
      
      {/* Glow effect for the primary color */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#C9A880]/8 blur-[120px] z-5"></div>
      
      <div className="relative z-20 container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">
              Asegura
            </span>{" "}
            tu precio DE POR VIDA
          </h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Mira, voy a ser CLARO contigo. Los precios aumentarán después de los primeros 200 miembros fundadores, y esto NO es una táctica de marketing.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Pricing options */}
          <div className="w-full lg:w-7/12 bg-[#0c0a08]/80 backdrop-blur-sm rounded-3xl p-8 border border-[#C9A880]/20 shadow-xl overflow-hidden relative">
            {/* Early adopter badge */}
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-[#C9A880]/10 border border-[#C9A880]/20 text-[#C9A880]">
              <span className="text-sm font-medium">Descuento para Adoptadores Tempranos (SÓLO 200 PLAZAS)</span>
            </div>

            {/* Monthly option */}
            <div className="p-6 mb-5 bg-[#13110d] rounded-xl border border-[#C9A880]/30 transition-all duration-300 hover:border-[#C9A880]/50">
              <h3 className="text-xl font-bold text-white mb-5">Membresía Mensual</h3>
              <div className="flex items-baseline mb-1">
                <span className="text-4xl font-bold text-white">€59</span>
                <span className="text-lg text-white/70 ml-2">/mes</span>
              </div>
              <div className="flex items-center mb-5">
                <span className="text-white/60 line-through mr-2">Normalmente €79</span>
                <span className="bg-[#C9A880]/20 text-[#C9A880] px-2 py-1 rounded text-sm font-medium">25% DE DESCUENTAZO</span>
              </div>
            </div>

            {/* Annual option */}
            <div className="p-6 bg-gradient-to-br from-[#13110d] to-[#1a1713] rounded-xl border border-[#C9A880]/40 transition-all duration-300 hover:border-[#C9A880]/70 relative overflow-hidden">
              {/* Best value badge */}
              <div className="absolute top-0 right-0">
                <div className="bg-[#C9A880] text-black text-xs font-bold px-4 py-1 uppercase transform rotate-0">
                  Mejor Valor
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-5">Membresía Anual</h3>
              <div className="flex items-baseline mb-1">
                <span className="text-4xl font-bold text-white">€475</span>
                <span className="text-lg text-white/70 ml-2">/año</span>
              </div>
              <div className="flex items-center mb-5">
                <span className="text-white/60 line-through mr-2">Normalmente €948</span>
                <span className="bg-[#C9A880]/20 text-[#C9A880] px-2 py-1 rounded text-sm font-medium">¡50% DE DESCUENTO!</span>
              </div>
            </div>
          </div>

          {/* Right column - Features */}
          <div className="w-full lg:w-5/12 bg-[#0c0a08]/80 backdrop-blur-sm rounded-3xl p-8 border border-[#C9A880]/20 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6">Qué está incluido:</h3>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg 
                  className="h-5 w-5 text-[#C9A880] mt-0.5 mr-3 flex-shrink-0" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span className="text-white">Acceso a TODOS los cursos actuales y futuros</span>
              </li>
              <li className="flex items-start">
                <svg 
                  className="h-5 w-5 text-[#C9A880] mt-0.5 mr-3 flex-shrink-0" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span className="text-white">Sesiones en vivo semanales y talleres PRÁCTICOS</span>
              </li>
              <li className="flex items-start">
                <svg 
                  className="h-5 w-5 text-[#C9A880] mt-0.5 mr-3 flex-shrink-0" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span className="text-white">Acceso a la comunidad privada DE ÉLITE</span>
              </li>
              <li className="flex items-start">
                <svg 
                  className="h-5 w-5 text-[#C9A880] mt-0.5 mr-3 flex-shrink-0" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span className="text-white">Plantillas y recursos para agentes de IA PROFESIONALES</span>
              </li>
            </ul>
            
            {/* Bonus features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <span className="h-5 w-5 text-[#C9A880] mt-0.5 mr-3 flex-shrink-0">🎁</span>
                <span className="text-[#C9A880] font-medium">BONUS - Eventos exclusivos para fundadores</span>
              </div>
              <div className="flex items-start">
                <span className="h-5 w-5 text-[#C9A880] mt-0.5 mr-3 flex-shrink-0">🎁</span>
                <span className="text-[#C9A880] font-medium">BONUS - Grupo de networking exclusivo GARANTIZADO</span>
              </div>
            </div>

            {/* CTA Button */}
            <SmoothScrollLink href="#newsletter-form">
              <RainbowButtonDemo className="w-full py-4 text-lg font-medium">
                <span className="flex items-center justify-center">
                  DEBES RESERVAR TU PLAZA YA
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </RainbowButtonDemo>
            </SmoothScrollLink>
          </div>
        </div>
      </div>
    </section>
  );
}
