"use client";

import { Users, Lightbulb, Trophy } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

import { AnimatedButton } from "@/components/animatedButton";
import { MagicCard } from "@/components/magicui/magic-card";

export function NewsletterBenefits() {
  const { theme } = useTheme();

  const benefits = [
    {
      icon: <Users className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]" />,
      title: "Comunidad Exclusiva",
      content: [
        "Únete a una comunidad selecta de profesionales y entusiastas de la IA comprometidos con el dominio de la inteligencia artificial.",
        "Comparte experiencias, colabora en proyectos y establece contactos con personas que están transformando sus negocios y carreras con IA."
      ]
    },
    {
      icon: <Lightbulb className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]" />,
      title: "Conocimiento Práctico",
      content: [
        "Accede a recursos exclusivos, workshops y eventos en directo enfocados en aplicaciones prácticas de IA para resultados inmediatos.",
        "Obtén guías paso a paso para implementar soluciones de IA que multipliquen tu productividad y generen ventajas competitivas reales."
      ]
    },
    {
      icon: <Trophy className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]" />,
      title: "Ventaja Competitiva",
      content: [
        "Mantente a la vanguardia con acceso prioritario a las últimas herramientas, técnicas y estrategias de IA antes que el público general.",
        "Implementa soluciones innovadoras que te separarán de la competencia y te posicionarán como líder en tu sector."
      ]
    }
  ];

  return (
    <section className="py-16 pb-8 bg-[#0a0a0a] mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-center mb-2">
          <AnimatedButton>Beneficios de la Comunidad</AnimatedButton>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
          Lo que obtendrás al unirte a <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">nuestra comunidad</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <MagicCard
              key={index}
              className="cursor-pointer p-6 h-auto min-h-[320px] flex flex-col text-left"
              gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
              gradientSize={300}
              gradientFrom="#C9A880"
              gradientTo="#A78355"
            >
              <div className="flex flex-col h-full">
                {benefit.icon}
                <h3 className="text-xl font-bold mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]">
                  {benefit.title}
                </h3>
                <div className="space-y-4 text-gray-300 text-sm leading-relaxed flex-grow">
                  {benefit.content.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </MagicCard>
          ))}
        </div>

        {/* Botón con margen inferior reducido */}
        <div className="text-center mt-8 mb-0">
          <Link href="#newsletter-form" scroll={false}>
            <AnimatedButton>Unirme a la Lista de Espera</AnimatedButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
