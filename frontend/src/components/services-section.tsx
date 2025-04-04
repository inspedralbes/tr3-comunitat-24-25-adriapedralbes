import { Code2, Bot, Workflow } from "lucide-react";

import { Card } from "@/components/ui/card";

export function ServicesSection() {
  return (
    <section className="bg-[#0D0D14] py-24 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
          Nuestros Servicios
        </h2>
        <p className="text-gray-400 max-w-3xl mx-auto mb-16 text-lg">
          Te apoyamos en el descubrimiento e implementación de tecnologías de IA
          y Automatizaciones, garantizando una transición fluida desde el
          concepto inicial hasta la implementación completa y la obtención de
          resultados.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Asistentes De IA Card */}
          <Card className="bg-gray-900/50 border-gray-800 p-6 backdrop-blur relative group hover:border-purple-500/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-48 mb-6 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Bot className="w-16 h-16 text-purple-500" />
                <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen_2025-02-22_232752696-pLqkFsIaEPGOLdCPtc3zc2n0JhkqaN.png')] bg-center bg-no-repeat opacity-10" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Asistentes De IA
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Atención al cliente, generación y cualificación de leads,
              recomendación de productos para ecommerce, asistentes de voz,
              soluciones personalizadas...
            </p>
          </Card>

          {/* Proyectos Personalizados Card */}
          <Card className="bg-gray-900/50 border-gray-800 p-6 backdrop-blur relative group hover:border-purple-500/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-48 mb-6 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Code2 className="w-16 h-16 text-purple-500" />
                <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen_2025-02-22_232752696-pLqkFsIaEPGOLdCPtc3zc2n0JhkqaN.png')] bg-center bg-no-repeat opacity-10" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Proyectos Personalizados
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Análisis Inteligente de Datos, Automatización de Procesos
              repetitivos, publicación de productos en páginas web, soluciones a
              medida...
            </p>
          </Card>

          {/* Automatizaciones Card */}
          <Card className="bg-gray-900/50 border-gray-800 p-6 backdrop-blur relative group hover:border-purple-500/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-48 mb-6 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Workflow className="w-16 h-16 text-purple-500" />
                <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen_2025-02-22_232752696-pLqkFsIaEPGOLdCPtc3zc2n0JhkqaN.png')] bg-center bg-no-repeat opacity-10" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Automatizaciones
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Automatización de Redes Sociales, Email Marketing, Nutrición de
              Leads, Web Scraping, Agentes IA Autónomos...
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
