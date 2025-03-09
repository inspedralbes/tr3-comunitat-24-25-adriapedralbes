"use client";

import { Star, Quote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AnimatedButton } from "@/components/animatedButton";
import { RainbowButtonDemo } from "@/components/rainbowButton";
import { Card } from "@/components/ui/card";

export function NewsletterTestimonials() {
  const testimonials = [
    {
      stars: 5,
      text: "La Newsletter de FuturPrive es muy interesante porque aporta buenos consejos y contenido que ayuda a impulsar y conocer más del Marketing Digital y la IA.",
      name: "Claudia Garzón",
      initial: "C",
      bgColor: "bg-[#C9A880]",
      textColor: "text-black"
    },
    {
      stars: 5,
      text: "Amo sus Newsletters. Mucha info fácil de leer y entender. Realmente han transformado mi forma de aplicar la IA en mi negocio.",
      name: "Natalia Gómez",
      image: "https://randomuser.me/api/portraits/women/23.jpg"
    },
    {
      stars: 5,
      text: "Me encanta su dinamismo en las Newsletters. El contenido es muy valioso hasta para los que estamos empezando en el mundo de la IA y el Marketing Digital.",
      name: "Cindy González",
      image: "https://randomuser.me/api/portraits/women/47.jpg"
    },
    {
      stars: 5,
      text: "¡Siempre el mejor contenido! Son inspiración pura y mi fuente más confiable de noticias y tendencias relacionadas con el Marketing, el SEO y la IA.",
      name: "Pablo Martín Guanca",
      image: "https://randomuser.me/api/portraits/men/15.jpg"
    },
    {
      stars: 5,
      text: "De los pocos que ofrecen contenido gratuito de valor. Otros venden humo para que compren sus productos. ¡FuturPrive habla con consejos reales!",
      name: "Bryan Morales",
      initial: "B",
      bgColor: "bg-[#C9A880]",
      textColor: "text-black"
    },
    {
      stars: 5,
      text: "Extraordinario contenido que imparten de forma gratuita. Sus consejos sobre automatización con IA me han ahorrado horas de trabajo. Muchas gracias.",
      name: "Ana Claramonte",
      image: "https://randomuser.me/api/portraits/women/45.jpg"
    }
  ];

  return (
    <section className="bg-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-center mb-4">
          <AnimatedButton>Opiniones</AnimatedButton>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
          Esto dicen de <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">nosotros</span>...
        </h2>
        
        {/* Testimonios destacados (versión móvil: 1 columna, tablet: 2 columnas, desktop: 3 columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden border-0 h-full bg-gradient-to-br from-gray-900/80 to-black backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Cuota decorativa */}
              <div className="absolute -top-2 -right-2 text-[#C9A880]/10">
                <Quote size={80} />
              </div>
              
              {/* Estrellas de valoración */}
              <div className="flex text-[#C9A880] mb-4">
                {Array.from({ length: testimonial.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              
              {/* Texto del testimonio */}
              <p className="text-white/90 text-base font-light mb-6 leading-relaxed italic relative z-10">
                <span className="text-[#C9A880] text-xl font-serif">“</span>{testimonial.text}<span className="text-[#C9A880] text-xl font-serif">”</span>
              </p>
              
              {/* Información del usuario */}
              <div className="flex items-center mt-auto pt-4 border-t border-[#C9A880]/20">
                {testimonial.image ? (
                  <Image 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full mr-4 border-2 border-[#C9A880]/30"
                    width={48}
                    height={48}
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full ${testimonial.bgColor} flex items-center justify-center ${testimonial.textColor} font-bold mr-4 border-2 border-[#C9A880]/30`}>
                    {testimonial.initial}
                  </div>
                )}
                
                <div>
                  <h4 className="font-bold text-white text-base">{testimonial.name}</h4>
                  <p className="text-xs text-[#C9A880]/80">Suscriptor/a de la Newsletter</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link href="#newsletter-form" scroll={false}>
            <RainbowButtonDemo>
              Sí, quiero recibir la newsletter
            </RainbowButtonDemo>
          </Link>
        </div>
      </div>
    </section>
  );
}
