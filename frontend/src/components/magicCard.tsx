"use client";

import { Upload, Wand2, Download } from "lucide-react";
import { useTheme } from "next-themes";

import { MagicCard } from "@/components/magicui/magic-card";

export function MagicCardDemo() {
  const { theme } = useTheme();

  const cards = [
    {
      icon: (
        <Upload className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]" />
      ),
      title: "Agenda tu consulta",
      description:
        "30 minutos donde descubrirás exactamente cómo la tecnología puede hacer crecer tu negocio. Sin promesas vacías.",
    },
    {
      icon: (
        <Wand2 className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]" />
      ),
      title: "Planificar Soluciones",
      description:
        "Creamos un plan concreto para reducir costes donde realmente importa. Nada de soluciones genéricas.",
    },
    {
      icon: (
        <Download className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]" />
      ),
      title: "Implementar automatización",
      description: "Ponemos todo en marcha sin que tengas que preocuparte por nada técnico. Tú céntrate en ver crecer los números.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
      {cards.map((card, index) => (
        <MagicCard
          key={index}
          className="cursor-pointer p-6 h-[220px] min-h-[220px] flex flex-col justify-center text-left relative"
          gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
          gradientSize={300}
          gradientFrom="#C9A880"
          gradientTo="#A78355"
        >
          {/* Número de paso en la esquina superior derecha */}
          <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full border border-gray-500/30 text-white text-xl font-bold transition-colors duration-300 group-hover:border-[#C9A880]/80">
            {index + 1}
          </div>

          <div className="flex flex-col items-start">
            {card.icon}
            <h3 className="text-lg font-semibold mb-2 text-white transition-colors duration-300 group-hover:text-[#C9A880]">
              {card.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {card.description}
            </p>
          </div>
        </MagicCard>
      ))}
    </div>
  );
}
