"use client";

import { Upload, Wand2, Download } from "lucide-react";
import { useTheme } from "next-themes";

import { MagicCard } from "@/components/magicui/magic-card";

export function MagicCardDemo() {
  const { theme } = useTheme();

  const cards = [
    {
      icon: (
        <Upload className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-purple-400" />
      ),
      title: "Agenda tu consulta",
      description:
        "Agenda tu consulta gratuita y te mostramos cómo impulsar tu proyecto con tecnología.",
    },
    {
      icon: (
        <Wand2 className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-purple-400" />
      ),
      title: "Planificar Soluciones",
      description:
        "Planificamos y automatizamos procesos para reducir costes y maximizar beneficios.",
    },
    {
      icon: (
        <Download className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-purple-400" />
      ),
      title: "Implementar automatización",
      description: "Implementamos soluciones personalizadas para tu proyecto.",
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
          gradientFrom="#6366f1"
          gradientTo="#8b5cf6"
        >
          {/* Número de paso en la esquina superior derecha */}
          <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full border border-gray-500/30 text-white text-xl font-bold transition-colors duration-300 group-hover:border-purple-500/80">
            {index + 1}
          </div>

          <div className="flex flex-col items-start">
            {card.icon}
            <h3 className="text-lg font-semibold mb-2 text-white transition-colors duration-300 group-hover:text-purple-400">
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
