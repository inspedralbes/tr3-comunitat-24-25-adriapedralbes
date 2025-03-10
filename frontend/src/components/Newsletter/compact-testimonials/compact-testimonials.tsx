"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import { AnimatedButton } from "@/components/animatedButton";

// Testimonios compactos inspirados en la imagen de referencia
const testimonials = [
  {
    name: "Carlos",
    username: "@carlosfinanzas",
    body: "Implementación perfecta. Ahora procesamos datos en minutos, no días.",
    img: "https://i.pravatar.cc/150?img=12"
  },
  {
    name: "Elena",
    username: "@elenamarketing",
    body: "Incrementamos conversiones un 32% con su sistema de recomendación.",
    img: "https://i.pravatar.cc/150?img=9"
  },
  {
    name: "David",
    username: "@davidempresa",
    body: "Automatizamos procesos clave y liberamos tiempo para innovar.",
    img: "https://i.pravatar.cc/150?img=8"
  },
  {
    name: "Laura",
    username: "@laurarrhh",
    body: "La mejor inversión tecnológica que hemos hecho en años.",
    img: "https://i.pravatar.cc/150?img=25"
  },
  {
    name: "Miguel",
    username: "@migueltech",
    body: "Su equipo entendió nuestro negocio desde el primer día. Resultados inmediatos.",
    img: "https://i.pravatar.cc/150?img=11"
  }
];

export function CompactTestimonials() {
  // Estado para controlar cuáles testimonios mostramos
  const [activeTestimonials, setActiveTestimonials] = useState(testimonials.slice(0, 3));
  
  // Función para rotar testimonios cada cierto tiempo
  useEffect(() => {
    const interval = setInterval(() => {
      // Rotamos los testimonios mostrando diferentes cada vez
      const startIdx = Math.floor(Math.random() * (testimonials.length - 3));
      setActiveTestimonials(testimonials.slice(startIdx, startIdx + 3));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-black py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <AnimatedButton>Opiniones</AnimatedButton>
          <h2 className="text-3xl font-bold mt-4 mb-6">Lo que dicen nuestros clientes</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Nos dedicamos a crear soluciones que realmente impactan en los resultados de nuestros clientes. 
            Esto es lo que dicen de nosotros:
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeTestimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/50"
            >
              <div className="flex items-center mb-4">
                <Image 
                  src={testimonial.img} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                  width={48}
                  height={48}
                />
                <div>
                  <p className="font-medium text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.username}</p>
                </div>
              </div>
              <p className="text-gray-300">{testimonial.body}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="#newsletter-form" scroll={false}>
            <button className="bg-gradient-to-r from-[#C9A880] to-[#A78355] hover:from-[#A78355] hover:to-[#C9A880] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
              Únete a nuestra comunidad
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
