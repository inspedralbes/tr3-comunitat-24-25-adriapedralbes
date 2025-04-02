"use client";

import React from "react";
import { Rocket, Code } from "lucide-react";
import { useTheme } from "next-themes";

import { AnimatedButton } from "@/components/animatedButton";
import { MagicCard } from "@/components/magicui/magic-card";

export function NewsletterCommunity() {
  const { theme } = useTheme();

  const communityTargets = [
    {
      icon: <Rocket className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]" />,
      title: "Para Innovadores y Fundadores",
      content: "¿Tienes un negocio? ¿Estás harto de ver cómo otros crecen con IA mientras tú sigues igual? Aprenderás a integrar agentes de IA que OPTIMIZARÁN tus operaciones, ACELERARÁN tu crecimiento y TRANSFORMARÁN tus ideas en éxitos que podrás contar (y documentar). Conmigo se forman empresarios que quieren VER CAMBIOS REALES."
    },
    {
      icon: <Code className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]" />,
      title: "Para Desarrolladores y Entusiastas de la Tecnología",
      content: "Domina habilidades y conceptos de IA de alto nivel ESENCIALES para construir agentes de IA robustos, escalables y listos para producción. Mientras otros siguen tutoriales obsoletos, tú estarás a la vanguardia. Mantente RELEVANTE a medida que el campo de la IA evoluciona rápidamente. NO toco de oídas, todo lo que enseño es fruto de MI experiencia."
    }
  ];

  return (
    <section className="py-16 pb-12 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-center mb-2">
          <AnimatedButton>¿Para quién es esto?</AnimatedButton>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-white">
          La Comunidad para <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">Ti</span>
        </h2>

        <p className="text-gray-300 text-center max-w-3xl mx-auto mb-12">
          Esta comunidad NO es para todo el mundo.
          Si buscas teoría, certificados bonitos o promesas vacías... este NO es tu sitio.
          Pero si quieres RESULTADOS TANGIBLES, sigue leyendo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {communityTargets.map((target, index) => (
            <MagicCard
              key={index}
              className="cursor-pointer p-6 h-auto min-h-[250px] flex flex-col text-left"
              gradientSize={300}
              gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
              gradientFrom="#C9A880"
              gradientTo="#A78355"
            >
              <div className="flex flex-col h-full">
                {target.icon}
                <h3 className="text-xl font-bold mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]">
                  {target.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {target.content}
                </p>
              </div>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  );
}
