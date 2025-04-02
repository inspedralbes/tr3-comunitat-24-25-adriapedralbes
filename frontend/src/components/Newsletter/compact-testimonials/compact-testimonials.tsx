"use client";

import Image from "next/image";
import Link from "next/link";

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
    name: "Javier",
    username: "@javiertech",
    body: "Soporte técnico excepcional y actualización constante.",
    img: "https://i.pravatar.cc/150?img=11"
  }
];

export function CompactTestimonials() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 bg-white">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Lo que dicen nuestros usuarios</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Descubre cómo empresas de todos los tamaños están transformando su productividad y eficiencia con nuestras soluciones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Image
                src={testimonial.img}
                alt={`${testimonial.name} avatar`}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                <p className="text-sm text-blue-600">{testimonial.username}</p>
              </div>
            </div>
            <p className="text-gray-700">&ldquo;{testimonial.body}&rdquo;</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <AnimatedButton>
          <Link href="#newsletter-signup" className="inline-block">
            Únete a nuestra newsletter
          </Link>
        </AnimatedButton>
      </div>
    </div>
  );
}
