"use client";

import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";

export function NewsletterGifts() {
  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Título centrado */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Tu <span className="bg-gradient-to-r from-[#C2A57C] to-[#D4B68E] bg-clip-text text-transparent">Guía</span> (que tiene RESULTADOS REALES)
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-16">
          {/* Columna de texto */}
          <div className="md:w-1/2">
            <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10">
              <p className="mb-8 text-gray-300 text-lg">
                Mira.
                No soy un teórico.
                
                Soy Cole Medin, entusiasta de la tecnología, desarrollador de software y emprendedor con más de cinco años DEDICADOS al dominio de la IA, especialmente la IA generativa y agentes de IA.
                
                Con un canal de YouTube que ha crecido hasta superar los 100.000 suscriptores, he ayudado a MILES de personas a construir y aprovechar la IA para resolver problemas del mundo real.
              </p>

              <p className="mb-6 text-gray-300 text-lg">
                Mi trayectoria incluye trabajar como desarrollador de software para una empresa Fortune 500 y asesorar a numerosas startups, guiando sus estrategias e integración de IA.

                He visto de primera mano el INMENSO potencial y los peligros de la IA, lo que me ha equipado para ofrecer conocimientos PRÁCTICOS y ACCIONABLES que pueden transformar tus habilidades y tu negocio.
                
                Lo que enseño es fruto de mi PROPIA experiencia. No toco de oídas.
              </p>
            </div>
          </div>

          {/* Columna de imagen */}
          <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
            <div className="relative w-72 h-80 md:w-96 md:h-[28rem] overflow-hidden rounded-xl border-2 border-[#C2A57C]">
              {/* Efecto de luz detrás de la imagen */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#C2A57C]/30 to-[#D4B68E]/20 opacity-40"></div>
              
              {/* Imagen */}
              <Image 
                src="/adria.jpg" 
                alt="Cole Medin" 
                width={500}
                height={600}
                className="w-full h-full object-cover"
                unoptimized={true}
              />
              
              {/* Efecto de código en el fondo */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
