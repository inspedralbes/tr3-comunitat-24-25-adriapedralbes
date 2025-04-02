"use client";

import { Check, ExternalLink } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";

import { AnimatedButton } from "@/components/animatedButton";
import { MagicCard } from "@/components/magicui/magic-card";

export function NewsletterSkills() {
  const { theme } = useTheme();

  const skillTopics = [
    "Construyendo Agentes de IA Listos para Producción",
    "Arquitectura de Agentes de IA",
    "Expertos en Conocimiento de IA (RAG y Más)",
    "IA Local (IA Segura y Privada)",
    "Casos de Uso de IA en el Mundo Real",
    "Uso de Asistentes de Programación con IA",
    "Monetización de Agentes de IA",
    "Construyendo Agentes de IA sin Código",
    "Herramientas y Frameworks de IA"
  ];

  const stats = [
    {
      percentage: "92%",
      text: "de las empresas planean invertir más en IA en los próximos años, pero solo el 1% considera que su uso de IA es \"maduro\".",
      source: "McKinsey & Company",
      link: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/superagency-in-the-workplace-empowering-people-to-unlock-ais-full-potential-at-work"
    },
    {
      percentage: "82%",
      text: "de las grandes empresas planean implementar agentes para 2027.",
      source: "Capgemini Research Institute",
      link: "https://www.capgemini.com/wp-content/uploads/2024/05/Final-Web-Version-Report-Gen-AI-in-Organization-Refresh.pdf"
    },
    {
      percentage: "80%",
      text: "de todas las interacciones con clientes se proyecta que serán manejadas por IA para 2030.",
      source: "Gartner",
      link: "https://www.gartner.com/en/newsroom/press-releases/2023-08-30-gartner-reveals-three-technologies-that-will-transform-customer-service-and-support-by-2028"
    },
    {
      percentage: "30%",
      text: "de las empresas Fortune 500 ofrecerán servicio solo a través de un canal habilitado por IA para 2028.",
      source: "Gartner",
      link: "https://www.gartner.com/en/newsroom/press-releases/2024-12-11-gartner-predicts-that-30-percent-of-fortune-500-companies-will-offer-service-through-only-a-single-ai-enabled-channel-by-2028"
    }
  ];

  return (
    <section className="py-16 pb-12 bg-black">
      <div className="max-w-6xl mx-auto px-4">
        {/* What You'll Learn Section - Mantener el diseño minimalista actual */}
        <div className="mb-24">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-black border border-[#333] px-4 py-1.5">
              <span className="text-sm text-white font-medium">Desarrolla Habilidades FUNDAMENTALES</span>
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-center mb-6">
            Lo Que <span className="text-[#C9A880]">Aprenderás</span>
          </h2>
          
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-12">
            Nuestro currículum NO es teórico. Todo lo que enseñamos es fruto de EXPERIENCIA REAL 
            y está documentado con RESULTADOS REALES. Aquí no vendemos humo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {skillTopics.map((skill, index) => (
              <div 
                key={index} 
                className="bg-[#0a0a0a] border border-[#222] hover:border-[#333] rounded-xl p-4 transition-colors duration-300 flex items-center"
              >
                <div className="mr-3 flex-shrink-0">
                  <div className="bg-[#1c1c1c] rounded-full p-1.5">
                    <Check className="h-4 w-4 text-[#C9A880]" />
                  </div>
                </div>
                <span className="text-white text-sm">{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Why These Skills Matter Section - Restaurar el diseño con MagicCard */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-white">
            Por Qué Estas <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">Habilidades Importan</span>
          </h2>
          
          <p className="text-gray-300 text-center max-w-3xl mx-auto mb-12">
            La demanda de experiencia en IA está creciendo rápidamente en TODAS las industrias y quien no se adapte quedará FUERA del mercado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <MagicCard
                key={index}
                className="cursor-pointer p-6 h-auto flex flex-col text-left"
                gradientSize={300}
                gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                gradientFrom="#C9A880"
                gradientTo="#A78355"
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-3xl font-bold text-[#C9A880] mb-3 group-hover:text-white transition-colors duration-300">
                    {stat.percentage}
                  </h3>
                  <p className="text-white mb-4 text-sm md:text-base">
                    {stat.text}
                  </p>
                  
                  <a 
                    href={stat.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center text-[#C9A880]/70 text-sm mt-auto hover:text-[#C9A880] transition-colors"
                  >
                    <span>{stat.source}</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                  </a>
                </div>
              </MagicCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
