"use client";

import { Card } from "@/components/ui/card";
import { AnimatedButton } from "@/components/animatedButton";
import { RainbowButtonDemo } from "@/components/rainbowButton";
import { Star } from "lucide-react";
import Link from "next/link";

export function NewsletterTestimonials() {
  const testimonials = [
    {
      stars: 5,
      text: "La Newsletter de FuturPrive es muy interesante porque aporta buenos consejos y contenido que ayuda a impulsar y conocer más del Marketing Digital y la IA.",
      name: "Claudia Garzón",
      initial: "C",
      bgColor: "bg-purple-300",
      textColor: "text-purple-700"
    },
    {
      stars: 5,
      text: "Amo sus Newsletters. Mucha info fácil de leer y entender. Realmente han transformado mi forma de aplicar la IA en mi negocio.",
      name: "Natalia Gómez",
      image: "https://i.pravatar.cc/150?img=23"
    },
    {
      stars: 5,
      text: "Me encanta su dinamismo en las Newsletters. El contenido es muy valioso hasta para los que estamos empezando en el mundo de la IA y el Marketing Digital.",
      name: "Cindy González",
      image: "https://i.pravatar.cc/150?img=47"
    },
    {
      stars: 5,
      text: "¡Siempre el mejor contenido! Son inspiración pura y mi fuente más confiable de noticias y tendencias relacionadas con el Marketing, el SEO y la IA.",
      name: "Pablo Martín Guanca",
      image: "https://i.pravatar.cc/150?img=8"
    },
    {
      stars: 5,
      text: "De los pocos que ofrecen contenido gratuito de valor. Otros venden humo para que compren sus productos. ¡FuturPrive habla con consejos reales!",
      name: "Bryan Morales",
      initial: "B",
      bgColor: "bg-blue-300",
      textColor: "text-blue-700"
    },
    {
      stars: 5,
      text: "Extraordinario contenido que imparten de forma gratuita. Sus consejos sobre automatización con IA me han ahorrado horas de trabajo. Muchas gracias.",
      name: "Ana Claramonte",
      image: "https://i.pravatar.cc/150?img=45"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-black to-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-center mb-2">
          <AnimatedButton>Opiniones</AnimatedButton>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
          Esto dicen de <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">nosotros</span>...
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700/30 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex text-yellow-500 mb-3">
                {Array.from({ length: testimonial.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-300 text-sm mb-6 line-clamp-4">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center mt-auto">
                {testimonial.image ? (
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-10 h-10 rounded-full mr-3 border-2 border-white/10"
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full ${testimonial.bgColor} flex items-center justify-center ${testimonial.textColor} font-bold mr-3`}>
                    {testimonial.initial}
                  </div>
                )}
                
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-xs text-gray-400">Suscriptor/a de la Newsletter</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
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
