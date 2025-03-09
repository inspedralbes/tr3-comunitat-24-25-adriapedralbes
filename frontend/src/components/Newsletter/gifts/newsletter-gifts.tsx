"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";

import { AnimatedButton } from "@/components/animatedButton";
import { RainbowButtonDemo } from "@/components/rainbowButton";
import { Card } from "@/components/ui/card";

export function NewsletterGifts() {
  return (
    <section className="py-16 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <div className="relative max-w-md mx-auto md:mx-0">
              {/* Efecto de luz detrás de las cards */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#C9A880]/30 rounded-full blur-3xl"></div>

              {/* Cards de regalos */}
              <div className="relative">
                <div className="flex -space-x-6 transform rotate-[-8deg]">
                  <Card className="w-44 h-64 bg-gradient-to-br from-[#C9A880] to-[#A78355] rounded-xl shadow-xl text-white p-4 flex items-center justify-center transform hover:rotate-[-2deg] transition-transform">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🤖</div>
                      <div className="font-bold">+5000 HERRAMIENTAS IA PARA 40+ SECTORES</div>
                    </div>
                  </Card>

                  <Card className="w-44 h-64 bg-gradient-to-br from-[#C9A880] to-[#A78355] rounded-xl shadow-xl text-white p-4 flex items-center justify-center transform hover:rotate-[2deg] transition-transform z-10">
                    <div className="text-center">
                      <div className="text-4xl mb-2">💬</div>
                      <div className="font-bold">+300 PROMPTS PARA MASTERIZAR CHATGPT</div>
                    </div>
                  </Card>
                </div>

                <div className="flex -space-x-6 -mt-16 transform rotate-[5deg] z-20">
                  <Card className="w-44 h-64 bg-gradient-to-br from-[#C9A880] to-[#A78355] rounded-xl shadow-xl text-white p-4 flex items-center justify-center transform hover:rotate-[-2deg] transition-transform z-20">
                    <div className="text-center">
                      <div className="text-4xl mb-2">💰</div>
                      <div className="font-bold">IDEAS PARA GANAR DINERO CON CHATGPT</div>
                    </div>
                  </Card>

                  <Card className="w-44 h-64 bg-gradient-to-br from-[#C9A880] to-[#A78355] rounded-xl shadow-xl text-white p-4 flex items-center justify-center transform hover:rotate-[2deg] transition-transform">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🔌</div>
                      <div className="font-bold">LAS MEJORES EXTENSIONES DE CHATGPT</div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 mt-12 md:mt-0">
            <div className="flex justify-center mb-2">
              <AnimatedButton>Regalos exclusivos</AnimatedButton>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white text-center md:text-left">
              ¡Apúntate y llévate <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">4 regalos!</span>
            </h2>

            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <p className="text-lg mb-6 text-gray-300">
                Te voy a contar algo que me pasó la semana pasada: un cliente me dijo <span className="italic">&quot;Llevo 3 meses usando ChatGPT y siento que apenas estoy arañando la superficie&quot;</span>.
              </p>

              <p className="mb-6 text-gray-300">
                ¿Sabes qué le envié? Exactamente la misma colección de recursos que recibirás tú ahora. Su mensaje dos días después: <span className="font-semibold text-white">&quot;He conseguido en una semana lo que no logré en tres meses por mi cuenta&quot;</span>.
              </p>

              <p className="mb-6 text-gray-300">
                Y es que cuando se trata de IA, el problema no es la falta de información, sino el exceso. Necesitas alguien que filtre el ruido y te dé exactamente lo que funciona.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-gray-300"><span className="font-bold text-white">Directorio de +5000 herramientas IA:</span> Organizadas por sector. ¿Marketing? ¿Desarrollo? ¿Diseño? Tenemos herramientas específicas para ti.</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-gray-300"><span className="font-bold text-white">+300 Prompts para ChatGPT:</span> Los mismos que uso para que ChatGPT genere contenido que parece escrito por un experto de 10 años en cualquier campo.</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-gray-300"><span className="font-bold text-white">Ideas para monetizar ChatGPT:</span> 23 modelos de negocio probados para generar ingresos con IA (uno de mis suscriptores facturó 3.400€ en su primer mes).</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-gray-300"><span className="font-bold text-white">Bonus Extra:</span> Cada domingo recibes una perla de sabiduría IA que el 99% de usuarios desconoce. En mi última newsletter compartí un truco que ahorra 5 horas semanales en tareas administrativas.</p>
                </div>
              </div>

              <div className="text-center">
                <Link href="#newsletter-form" scroll={false}>
                  <RainbowButtonDemo>
                    ¡Quiero mis 4 regalos ahora!
                  </RainbowButtonDemo>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
