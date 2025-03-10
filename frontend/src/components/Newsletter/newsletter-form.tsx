"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the actual subscription logic
    // For now, we'll just simulate a successful submission
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute w-12 h-12 bg-purple-600/20 rounded-full"></div>
          <div className="relative">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
              <path d="M8 7h6"></path>
              <path d="M8 11h8"></path>
              <path d="M8 15h6"></path>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Heading */}
      <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-4xl">
        Emprende Aprendiendo
      </h2>
      
      {/* Subtitle */}
      <p className="mb-6 text-lg text-gray-400">
        Suscríbete GRATIS para recibir las últimas tendencias, 
        <br />estrategias, e ideas de negocio <span className="text-yellow-400">💡</span>
      </p>

      {/* Copywriting Section */}
      <div className="mb-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 text-left">
        <h3 className="text-xl font-bold mb-3 text-purple-400">Mantente al día de las últimas tendencias en Inteligencia Artificial</h3>
        
        <p className="mb-4 text-gray-300">
          ¿Te acuerdas de cuando la IA era solo ciencia ficción? Yo sí. Y ahora, mientras escribo esto, tengo 3 herramientas de IA abiertas que están haciendo mi trabajo más fácil (y más divertido). 
        </p>
        
        <p className="mb-4 text-gray-300">
          La verdad es que, en mi viaje como emprendedor, he aprendido que no se trata de <span className="italic">tener</span> todas las herramientas, sino de saber <span className="font-semibold">cuáles son las correctas para ti</span>.
        </p>

        <div className="mb-4 border-l-4 border-purple-500 pl-4 py-1">
          <p className="text-gray-300">
            &quot;La diferencia entre quienes despegan y quienes se estancan está en saber qué tendencias de IA realmente importan para tu negocio.&quot;
          </p>
        </div>

        <h4 className="font-semibold text-white mb-2">Lo que obtendrás cada semana:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4 text-gray-300">
          <li>Análisis de las herramientas de IA que están cambiando el juego (sin el palabrerío técnico)</li>
          <li>Estrategias probadas que puedes implementar <span className="italic">hoy mismo</span></li>
          <li>Historias reales de emprendedores como tú que están revolucionando sus negocios</li>
          <li>Un toque de humor para recordarte que la tecnología debe ser divertida 😉</li>
        </ul>

        <p className="text-gray-300">
          ¿Preparado para dejar de preguntarte &quot;¿qué me estoy perdiendo?&quot; y empezar a ser quien está al frente de la revolución?
        </p>
      </div>

      {submitted ? (
        <div className="p-4 bg-green-500/20 rounded-lg">
          <p className="text-green-400 font-medium">¡Gracias por suscribirte! Pronto recibirás nuestras novedades.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
          <input
            type="email"
            placeholder="Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 bg-[#1c1c1c] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Button 
            type="submit"
            className="bg-white text-black hover:bg-gray-200 px-8 py-3 font-medium"
          >
            Subscribe
          </Button>
        </form>
      )}
    </div>
  );
}
