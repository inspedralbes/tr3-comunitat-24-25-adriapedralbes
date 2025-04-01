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
        "Únete a una comunidad de gente COMO TÚ. No teóricos, sino profesionales y entusiastas que están HARTOS de tanto humo y quieren RESULTADOS REALES con IA.",
        "Aquí no se viene a presumir sino a TRABAJAR. Vas a compartir, colaborar y conectar con personas que, como tú, quieren transformar su negocio con IA y no tienen tiempo que perder."
      ]
    },
    {
      icon: <Lightbulb className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]" />,
      title: "Conocimiento Práctico",
      content: [
        "¿Estás cansado de tutoriales que no te llevan a ninguna parte? Aquí todo es PRÁCTICO. Recursos EXCLUSIVOS, workshops sin relleno y eventos en directo donde resolvemos problemas DEL MUNDO REAL.",
        "Tendrás guías paso a paso para implementar soluciones que MULTIPLICAN tu productividad desde el minuto UNO. Sin rodeos, sin teoría inútil, sin perder el tiempo."
      ]
    },
    {
      icon: <Trophy className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]" />,
      title: "Ventaja Competitiva",
      content: [
        "Mientras los demás siguen estudiando, tú ya estarás APLICANDO. Acceso PRIORITARIO a las últimas herramientas y estrategias de IA ANTES que la masa.",
        "Implementarás soluciones que te SEPARARÁN de tu competencia de forma tan evidente que hasta ellos lo notarán. Y para entonces será tarde (para ellos)."
      ]
    }
  ];

  return (
    <section className="py-16 pb-12 bg-[#0a0a0a] mt-0">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-center mb-2">
          <AnimatedButton>Beneficios de la Comunidad</AnimatedButton>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
          Lo que vas a conseguir (y NO es poca cosa) al unirte a <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">nuestra comunidad</span>
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

        {/* Se eliminó el botón "Unirme a la Lista de Espera" */}
      </div>
    </section>
  );
}
