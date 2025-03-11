"use client";

import { AlertCircle, Zap, Coffee } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

import { AnimatedButton } from "@/components/animatedButton";
import { MagicCard } from "@/components/magicui/magic-card";

export function NewsletterBenefits() {
  const { theme } = useTheme();

  const benefits = [
    {
      icon: <AlertCircle className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]" />,
      title: "Entérate el primero de todo",
      content: [
        `Te voy a confesar algo: hace dos años, cuando GPT-3 salió, yo pensaba que era "otra moda pasajera". Ignoré todo sobre IA durante 3 meses... y me arrepentí como nunca cuando vi a mi competencia avanzar a pasos agigantados con ella.`,
        "Desde entonces, me prometí no volver a quedarme atrás. La semana pasada, detecté una herramienta de IA que está creando copias publicitarias con un 27% más de conversión. La compartí con mis suscriptores un mes antes de que los grandes medios comenzaran a hablar de ella. ¿El resultado? Ventaja competitiva pura y dura."
      ]
    },
    {
      icon: <Zap className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]" />,
      title: "Nos mojamos",
      content: [
        `"¿Esto de la IA es realmente tan revolucionario como dicen?" - me preguntó un cliente ayer. Mi respuesta fue clara: "Para algunos negocios ha sido transformador, para otros un despilfarro de dinero." Y esa honestidad brutal es lo que nos diferencia.`,
        "En FuturPrive no vendemos humo. Si una tecnología de IA no vale la pena, te lo diremos sin rodeos. Si una herramienta merece cada euro invertido, también. Nuestra única lealtad es hacia ti y tus resultados, no hacia vendedores de software o modas pasajeras."
      ]
    },
    {
      icon: <Coffee className="w-8 h-8 mb-4 text-white transition-colors duration-300 group-hover:text-[#C9A880]" />,
      title: "Sin tonterías",
      content: [
        "Si te digo que el mes pasado probé personalmente 17 herramientas de IA para un proyecto de automatización de marketing, ¿sabes cuántas valían realmente la pena? Solo 2. Las otras 15 eran básicamente una interfaz bonita sobre tecnologías genéricas.",
        "Cada email que te envío tiene al menos una acción concreta que puedes implementar HOY MISMO. Sin teoría para impresionar, sin jerga técnica para parecer más inteligente, sin relleno. Solo estrategias prácticas que puedes aplicar inmediatamente. Porque la vida es demasiado corta para contenido que no te ayude a crecer."
      ]
    }
  ];

  return (
    <section className="py-16 pb-8 bg-[#0a0a0a] mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-center mb-2">
          <AnimatedButton>Nuestra filosofía</AnimatedButton>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
          La actualidad de la mano de <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">expertos del sector</span>
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
            <AnimatedButton>Quiero estar al día</AnimatedButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
