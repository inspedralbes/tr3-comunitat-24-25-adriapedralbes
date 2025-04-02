"use client";

import { Code, Users, Lightbulb, Clock, Database, Layout, Server, TestTube, BarChart, BookOpen, Brain, Rocket, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

import { MagicCard } from "@/components/magicui/magic-card";
import { SmoothScrollLink } from "@/components/SmoothScroll";


// Tecnologías con sus rutas de imágenes
const techImages = {
  "Pydantic IA": "/tecnologias/pydanticai.webp",
  "n8n": "/tecnologias/n8n.webp",
  "LangGraph": "/tecnologias/langgraph.webp",
  "Claude MCP": "/tecnologias/claudemcp.webp",
  "Docker": "/tecnologias/docker.webp",
  "React": "/tecnologias/react.webp",
  "Supabase": "/tecnologias/supabase.webp",
  "Stripe": "/tecnologias/stripe.webp",
  "Cursor": "/tecnologias/cursor.webp",
  "Windsurf": "/tecnologias/windsurf.webp",
  "Cline": "/tecnologias/cline.webp",
  "Roo Code": "/tecnologias/roocode.webp",
  "OpenAI": "/tecnologias/openai.webp",
  "Claude": "/tecnologias/claude.webp",
  "Qwen": "/tecnologias/qwen.webp",
  "Mistral": "/tecnologias/mistral.webp"
};

// Definición de los módulos del curso
const courseModules = [
  {
    id: 1,
    title: "Introducción",
    description: "Empieza con los fundamentos de los agentes IA y comprende la base del curso.",
    available: true,
    icon: <BookOpen />
  },
  {
    id: 2,
    title: "El Proceso de Agentes IA",
    description: "Aprende el proceso de principio a fin para planificar, construir y desplegar agentes IA.",
    available: true,
    icon: <Clock />
  },
  {
    id: 3,
    title: "Prototipado de Agentes IA con n8n",
    description: "Prototipa tus agentes IA usando n8n - una plataforma de automatización IA sin código.",
    available: true,
    icon: <Lightbulb />
  },
  {
    id: 4,
    title: "Construcción de Agentes IA con Pydantic",
    description: "Construye un agente IA completo usando Pydantic - un framework robusto para agentes IA en Python.",
    available: true,
    icon: <Code />
  },
  {
    id: 5,
    title: "Aplicación para Agentes IA (Frontend)",
    description: "Diseña e implementa el frontend para tus aplicaciones de agentes IA y monetiza tus agentes.",
    available: false,
    icon: <Layout />
  },
  {
    id: 6,
    title: "Despliegue de Agentes IA",
    description: "Aprende cómo desplegar tus agentes IA a entornos de producción.",
    available: false,
    icon: <Server />
  },
  {
    id: 7,
    title: "Arquitecturas Avanzadas para Agentes",
    description: "Explora flujos de trabajo y patrones arquitectónicos complejos para casos de uso avanzados.",
    available: false,
    icon: <Brain />
  },
  {
    id: 8,
    title: "Pruebas de Agentes IA",
    description: "Aprende estrategias completas de pruebas para agentes IA para garantizar su fiabilidad.",
    available: false,
    icon: <TestTube />
  },
  {
    id: 9,
    title: "Evaluación de Agentes IA",
    description: "Domina técnicas para evaluar y mejorar el rendimiento de los agentes IA.",
    available: false,
    icon: <BarChart />
  },
  {
    id: 10,
    title: "Guías Extra",
    description: "Guías adicionales y técnicas avanzadas para llevar tus habilidades de IA al siguiente nivel.",
    available: false,
    icon: <Rocket />
  }
];

// Cursos adicionales próximamente
const upcomingCourses = [
  {
    id: 1,
    title: "Agentes de Conocimiento Avanzado",
    description: "Domina RAG, Memoria y técnicas avanzadas para construir potentes agentes de conocimiento.",
    icon: <BookOpen className="h-10 w-10 text-white" />
  },
  {
    id: 2,
    title: "Agentes IA para el Mundo Real",
    description: "Aprende a construir agentes IA para casos de uso específicos del mundo real y aplicaciones empresariales.",
    icon: <Rocket className="h-10 w-10 text-white" />
  },
  {
    id: 3,
    title: "Inmersión en IA Local",
    description: "Guía completa para usar IA local para mayor privacidad, control y reducción de costes.",
    icon: <Database className="h-10 w-10 text-white" />
  }
];

// Herramientas y frameworks
const tools = [
  "Pydantic IA",
  "n8n",
  "LangGraph",
  "Claude MCP",
  "Docker",
  "React",
  "Supabase",
  "Stripe"
];

// IDEs y LLMs
const ides = [
  "Cursor",
  "Windsurf",
  "Cline",
  "Roo Code"
];

const llms = [
  "OpenAI",
  "Claude",
  "Qwen",
  "Mistral"
];

// Componente para elementos del FAQ
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#C9A880]/20 last:border-b-0 py-5">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h4 className="text-lg font-medium">{question}</h4>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 border border-[#C9A880]/30 text-[#C9A880]">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      <div
        className={`mt-3 text-gray-400 overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <p className="pb-2">{answer}</p>
      </div>
    </div>
  );
};

// Componente para cada módulo del curso
const ModuleCard = ({ module }: { module: typeof courseModules[0] }) => {
  return (
    <div className="bg-[#0a0a0a] border border-[#C9A880]/20 hover:border-[#C9A880]/40 rounded-xl p-6 transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className="bg-black/60 rounded-lg p-3 border border-[#C9A880]/20">
          {module.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-[#131313] px-3 py-1 rounded-full text-xs">
              Módulo {module.id}
            </div>
            <div className={`text-xs px-3 py-1 rounded-full ${module.available ? 'bg-[#C9A880]/20 text-[#C9A880]' : 'bg-gray-800/30 text-gray-400'}`}>
              {module.available ? 'Disponible en Lanzamiento' : 'Próximamente'}
            </div>
          </div>
          <h3 className="text-lg font-bold mb-2">{module.title}</h3>
          <p className="text-sm text-gray-400">{module.description}</p>
        </div>
      </div>
    </div>
  );
};

// Componente para cursos próximos
const UpcomingCourseCard = ({ course }: { course: typeof upcomingCourses[0] }) => {
  return (
    <div className="bg-[#0a0a0a] border border-[#C9A880]/20 hover:border-[#C9A880]/40 rounded-xl p-8 transition-all duration-300 flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center pt-4">
        <div className="bg-black/60 rounded-full p-5 mb-6 w-20 h-20 flex items-center justify-center border border-[#C9A880]/20 mt-4">
          <div className="flex items-center justify-center">
            {course.icon}
          </div>
        </div>
        <h3 className="text-xl font-bold mb-4">{course.title}</h3>
        <p className="text-sm text-gray-400">{course.description}</p>
      </div>
    </div>
  );
};

export function NewsletterCourses() {
  return (
    <section className="relative py-24 pb-36 bg-[#0a0a0a]">
      {/* Fondos con gradientes */}
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <div className="h-full w-full bg-gradient-to-r from-[#C9A880]/20 to-[#C9A880]/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4">
        {/* Encabezado de la sección */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 bg-[#C9A880]/10 text-[#C9A880] rounded-full font-medium text-sm mb-4 border border-[#C9A880]/20">
            Aprende con los mejores
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Cursos <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">de IA</span> Destacados
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Múltiples cursos exclusivos de IA estarán disponibles como recursos en la comunidad,
            incluyendo un curso muy completo de Dominio de Agentes IA en desarrollo ahora mismo!
          </p>
        </div>

        {/* Sección del curso principal */}
        <div className="bg-[#080604]/70 backdrop-blur-md rounded-3xl border border-[#C9A880]/25 p-10 mb-16">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-20 h-20 rounded-full bg-[#0c0c0c] flex items-center justify-center mb-6 border border-[#C9A880]/30">
              <Clock className="h-10 w-10 text-[#C9A880]" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Curso de Dominio de Agentes IA <span className="text-[#C9A880]">¡Próximamente!</span>
            </h3>
            <p className="text-gray-400 max-w-3xl">
              Estoy trabajando en un curso exclusivo que te enseñará todo lo que necesitas saber
              sobre planificación, construcción y despliegue de agentes IA. Los primeros módulos principales estarán
              disponibles cuando se abra la comunidad, ¡así que únete a la lista de espera para ser el primero en obtener acceso!
            </p>
            <SmoothScrollLink href="#newsletter-form">
              <button className="mt-8 px-6 py-3 bg-black border border-[#C9A880]/50 hover:border-[#C9A880] text-white rounded-full font-medium transition-all duration-300">
                Unirse a la Lista de Espera →
              </button>
            </SmoothScrollLink>
          </div>

          {/* Herramientas y frameworks */}
          <div className="mb-16">
            <h4 className="text-xl font-bold mb-4 text-center">
              Domina estas <span className="text-[#C9A880] hover:underline"><a href="#">herramientas y frameworks de IA</a></span>
            </h4>
            <p className="text-center text-gray-400 mb-8">
              Esta lista de tecnologías se actualizará a medida que la IA evolucione, y el enfoque siempre estará en
              las capacidades y habilidades básicas que resistirán la prueba del tiempo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Primera columna - primeras 4 herramientas */}
              <div className="space-y-4">
                <div className="bg-[#0a0a0a] border border-[#C9A880]/20 hover:border-[#C9A880]/40 rounded-xl p-4 flex items-center space-x-3 transition-all duration-300 h-16">
                  <Image
                    src={techImages["Pydantic IA"]}
                    alt="Pydantic AI"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                  <span>Pydantic AI</span>
                </div>

                <div className="bg-[#0a0a0a] border border-[#C9A880]/20 hover:border-[#C9A880]/40 rounded-xl p-4 flex items-center space-x-3 transition-all duration-300 h-16">
                  <Image
                    src={techImages["LangGraph"]}
                    alt="LangGraph"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                  <span>LangGraph</span>
                </div>

                <div className="bg-[#0a0a0a] border border-[#C9A880]/20 hover:border-[#C9A880]/40 rounded-xl p-4 flex items-center space-x-3 transition-all duration-300 h-16">
                  <Image
                    src={techImages["Docker"]}
                    alt="Docker"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                  <span>Docker</span>
                </div>

                <div className="bg-[#0a0a0a] border border-[#C9A880]/20 hover:border-[#C9A880]/40 rounded-xl p-4 flex items-center space-x-3 transition-all duration-300 h-16">
                  <Image
                    src={techImages["Supabase"]}
                    alt="Supabase"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                  <span>Supabase</span>
                </div>
              </div>

              {/* Segunda columna - últimas 4 herramientas */}
              <div className="space-y-4">
                <div className="bg-[#0a0a0a] border border-[#C9A880]/20 hover:border-[#C9A880]/40 rounded-xl p-4 flex items-center space-x-3 transition-all duration-300 h-16">
                  <Image
                    src={techImages["n8n"]}
                    alt="n8n"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                  <span>n8n</span>
                </div>

                <div className="bg-[#0a0a0a] border border-[#C9A880]/20 hover:border-[#C9A880]/40 rounded-xl p-4 flex items-center space-x-3 transition-all duration-300 h-16">
                  <Image
                    src={techImages["Claude MCP"]}
                    alt="Claude MCP"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                  <span>Claude MCP</span>
                </div>

                <div className="bg-[#0a0a0a] border border-[#C9A880]/20 hover:border-[#C9A880]/40 rounded-xl p-4 flex items-center space-x-3 transition-all duration-300 h-16">
                  <Image
                    src={techImages["React"]}
                    alt="React"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                  <span>React</span>
                </div>

                <div className="bg-[#0a0a0a] border border-[#C9A880]/20 hover:border-[#C9A880]/40 rounded-xl p-4 flex items-center space-x-3 transition-all duration-300 h-16">
                  <Image
                    src={techImages["Stripe"]}
                    alt="Stripe"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                  <span>Stripe</span>
                </div>
              </div>

              {/* Tercera columna - IDEs y LLMs */}
              <div className="space-y-4">
                <div className="bg-[#0a0a0a] border border-[#C9A880]/20 rounded-xl p-4">
                  <h5 className="text-sm font-semibold mb-3 flex items-center">
                    <code className="text-[#C9A880] mr-2">&lt;/&gt;</code>
                    IDEs de IA incluyendo:
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {ides.map((ide) => (
                      <div key={ide} className="flex items-center space-x-2">
                        <Image
                          src={techImages[ide as keyof typeof techImages]}
                          alt={ide}
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                        <span className="text-sm">{ide}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#C9A880]/20 rounded-xl p-4">
                  <h5 className="text-sm font-semibold mb-3 flex items-center">
                    <code className="text-[#C9A880] mr-2">🧠</code>
                    Trabajando con LLMs incluyendo:
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {llms.map((llm) => (
                      <div key={llm} className="flex items-center space-x-2">
                        <Image
                          src={techImages[llm as keyof typeof techImages]}
                          alt={llm}
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                        <span className="text-sm">{llm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Currículum completo del curso */}
          <div>
            <h4 className="text-xl font-bold mb-8 text-center">
              Currículum <span className="text-[#C9A880]">Completo del Curso</span>
            </h4>
            <p className="text-center text-gray-400 mb-8">
              Los primeros 4 módulos estarán disponibles cuando se lance la comunidad. Módulos adicionales serán
              publicados próximamente.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseModules.slice(0, 9).map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>

            {/* Bonus Guides - tratado de manera especial */}
            <div className="mt-6">
              <ModuleCard module={courseModules[9]} />
            </div>
          </div>
        </div>

        {/* Cursos adicionales próximamente */}
        <div>
          <h3 className="text-2xl font-bold mb-8 text-center">
            Próximos <span className="text-[#C9A880]">Cursos Adicionales</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingCourses.map((course) => (
              <MagicCard key={course.id} className="h-full">
                <UpcomingCourseCard course={course} />
              </MagicCard>
            ))}
          </div>
        </div>

        {/* Preguntas Frecuentes */}
        <div className="mt-24">
          <h3 className="text-2xl font-bold mb-3 text-center">
            Las Dudas que TODOS <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">Me Preguntan</span>
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto text-center mb-12">
            Estas son las preguntas que me hacen a diario y aquí tienes las respuestas SIN FILTROS.
          </p>

          <div className="max-w-3xl mx-auto bg-[#0c0c0c]/80 border border-[#C9A880]/20 rounded-xl p-6">
            <FAQItem
              question="¿NECESITO conocimientos previos para empezar?"
              answer="NO necesitas experiencia previa en IA. Mi módulo de introducción está pensado para CUALQUIER nivel. Pero ojo, si ya tienes nociones básicas de programación, avanzarás MÁS RÁPIDO. Lo importante es que tengas GANAS DE APRENDER, el resto lo ponemos nosotros."
            />

            <FAQItem
              question="¿Cómo accedo a TODO el contenido?"
              answer="Es muy simple: únete a la comunidad y tendrás ACCESO INMEDIATO a los primeros módulos. La parte buena es que irás recibiendo nuevo contenido a medida que lo publicamos. Y esto es importante: este contenido NO lo encontrarás en YouTube ni en cursos gratuitos. Es EXCLUSIVO para miembros."
            />

            <FAQItem
              question="¿Enseñas tecnologías que se usan DE VERDAD o solo teoría?"
              answer="Te lo digo MUY claro: NO enseño teoría inútil. Cada tecnología y framework que incluyo está ACTUALMENTE siendo usado en la industria real. No pierdo tu tiempo (ni el mío) con herramientas obsoletas. Todo lo que aprenderás podrás aplicarlo INMEDIATAMENTE en proyectos reales, y son exactamente las mismas herramientas que están buscando las empresas que contratan."
            />

            <FAQItem
              question="¿Mantienes el contenido ACTUALIZADO con los cambios de la IA?"
              answer="Si hay algo que me OBSESIONA es mantener todo al día. La IA cambia cada semana, y me aseguro de que nuestro contenido refleje eso. No como otros cursos que grabaron hace 2 años y siguen vendiendo lo mismo. Actualizamos MENSUALMENTE con nuevos módulos y revisamos TODO el material existente para incorporar los últimos avances. Si compras hoy, tendrás acceso a TODAS las actualizaciones futuras."
            />

            <FAQItem
              question="¿Me darás algún certificado cuando termine?"
              answer="Sí, recibirás un certificado digital por cada curso que completes. Pero seamos sinceros: lo que REALMENTE importa no es el papel, sino los PROYECTOS REALES que construirás durante el curso. Estos proyectos serán tu verdadero portfolio y lo que demostrará que SABES hacer lo que dices que sabes hacer. Un certificado solo dice que completaste algo, tus proyectos demuestran que DOMINAS la materia."
            />

            <FAQItem
              question="¿Me ayudarás cuando me atasque o tendré que arreglármelas solo?"
              answer="JAMÁS te dejaré abandonado. Odio cuando pago por un curso y luego no hay nadie que responda mis dudas. Por eso he creado un sistema de soporte COMPLETO: tendrás acceso a un foro EXCLUSIVO para miembros donde puedes preguntar lo que sea (y recibir respuestas en 24h máximo), sesiones semanales de Q&A EN VIVO, y la posibilidad de conectar con otros estudiantes que están en tu mismo camino. Nadie se queda atrás."
            />

            <FAQItem
              question="¿Necesito ser un EXPERTO en programación para seguir el curso?"
              answer="¡NO! Y esto es importante: he diseñado el curso para que CUALQUIERA pueda empezar. Si nunca has programado, podrás seguir el módulo de introducción sin problemas. Eso sí, si ya tienes algo de base, avanzarás más rápido en las partes técnicas. ADEMÁS: incluyo recursos adicionales ESPECÍFICOS para quienes necesiten reforzar estas habilidades. Lo importante es tu ACTITUD, no tu nivel inicial."
            />

            <FAQItem
              question="¿Cuánto tiempo tengo que dedicarle CADA SEMANA?"
              answer="Puedes avanzar a TU RITMO. No hay prisas ni fechas límite. Dicho esto, para sacarle el MÁXIMO JUGO, recomiendo dedicar unas 5-7 horas semanales. He estructurado todo en lecciones CORTAS y DIRECTAS para que puedas aprovechar incluso espacios de 30 minutos. Y lo mejor: tendrás ACCESO DE POR VIDA al contenido, así que puedes revisarlo cuando quieras. No es cuestión de prisa, sino de CONSTANCIA."
            />

            <FAQItem
              question="¿Y si me apunto y luego veo que NO es lo que esperaba?"
              answer="Tranquilo. Lo tengo MUY CLARO: si no estás satisfecho, no quiero tu dinero. Por eso ofrezco una garantía COMPLETA de 14 días. Prueba el contenido, explora la comunidad, haz preguntas, y si después de todo eso sientes que no es para ti... te devuelvo TODO tu dinero sin hacer preguntas incómodas. Así de simple. Sin letra pequeña, sin excusas. No quiero que nadie se quede con algo que no le APORTA VALOR."
            />

            <FAQItem
              question="¿Qué tipo de SOPORTE ofreces EXACTAMENTE?"
              answer="He creado un sistema de soporte MULTICAPA: 1) Acceso a la comunidad privada donde conectarás con otros estudiantes QUE ESTÁN HACIENDO LO MISMO que tú, 2) Sesiones grupales SEMANALES donde resolvemos dudas en directo, 3) La posibilidad de programar sesiones 1-a-1 de mentoría (sí, conmigo), y 4) Soporte técnico garantizado en menos de 24 HORAS para cualquier pregunta o problema. En resumen: NUNCA estarás solo en este viaje."
            />

            <FAQItem
              question="¿Qué seré capaz de CREAR cuando termine el curso?"
              answer="Te lo digo sin rodeos: al terminar podrás construir COSAS REALES Y ÚTILES. No teoría, sino productos que generan valor. Desarrollarás agentes IA COMPLETOS que automatizan tareas tediosas, crearás asistentes especializados para TU industria específica, implementarás soluciones de procesamiento de lenguaje natural, y construirás aplicaciones que integren MÚLTIPLES servicios de IA. Y lo mejor: cada módulo incluye proyectos PRÁCTICOS que irán directos a tu portfolio profesional. Esto no es un curso, es un trampolín para tu carrera."
            />
          </div>
        </div>

        {/* Espaciador adicional para resolver el problema de color con el footer */}
        <div className="h-16"></div>
      </div>
    </section>
  );
}
