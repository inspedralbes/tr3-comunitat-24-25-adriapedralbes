"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MagicCard } from "@/components/magicui/magic-card";
import { Code, Users, Lightbulb, Clock, Database, Layout, Server, TestTube, BarChart, BookOpen, Brain, Rocket, ChevronDown, ChevronUp } from "lucide-react";

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
        className={`mt-3 text-gray-400 overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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
            <button className="mt-8 px-6 py-3 bg-black border border-[#C9A880]/50 hover:border-[#C9A880] text-white rounded-full font-medium transition-all duration-300">
              Unirse a la Lista de Espera →
            </button>
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
            Preguntas <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">Frecuentes</span>
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto text-center mb-12">
            Encuentra respuestas a las preguntas más comunes sobre nuestros cursos de IA y cómo sacarles el máximo partido.
          </p>
          
          <div className="max-w-3xl mx-auto bg-[#0c0c0c]/80 border border-[#C9A880]/20 rounded-xl p-6">
            <FAQItem 
              question="¿Necesito conocimientos previos para estos cursos?"
              answer="No es necesario tener experiencia previa en IA para empezar. El módulo de introducción está diseñado para principiantes, aunque tener conocimientos básicos de programación te ayudará a avanzar más rápido en los módulos más técnicos."
            />
            
            <FAQItem 
              question="¿Cómo puedo acceder a los cursos?"
              answer="Los cursos estarán disponibles exclusivamente para los miembros de la comunidad. Al unirte, tendrás acceso inmediato a los primeros módulos disponibles y recibirás los nuevos a medida que se publiquen."
            />
            
            <FAQItem 
              question="¿Las tecnologías enseñadas son relevantes para proyectos reales?"
              answer="Absolutamente. Hemos seleccionado cuidadosamente las tecnologías y frameworks que están siendo adoptados en la industria. Aprenderás herramientas que puedes aplicar inmediatamente en proyectos reales y que tienen una gran demanda en el mercado laboral."
            />
            
            <FAQItem 
              question="¿Con qué frecuencia se actualizará el contenido?"
              answer="El campo de la IA evoluciona rápidamente, por lo que nos comprometemos a actualizar regularmente nuestro contenido. Añadiremos nuevos módulos mensualmente y actualizaremos el material existente para reflejar los últimos avances del sector."
            />
            
            <FAQItem 
              question="¿Recibiré alguna certificación al completar los cursos?"
              answer="Sí, al completar cada curso recibirás un certificado digital que podrás compartir en tu CV o redes profesionales. Además, los proyectos que desarrolles durante el curso servirán como portfolio para demostrar tus habilidades."
            />
            
            <FAQItem 
              question="¿Hay soporte disponible si tengo dudas durante el curso?"
              answer="Por supuesto. Tendrás acceso a un foro exclusivo para miembros donde podrás hacer preguntas, compartir tus proyectos y recibir feedback. También organizamos sesiones de Q&A en vivo con expertos en la materia."
            />
            
            <FAQItem 
              question="¿Necesito experiencia en programación?"
              answer="No es necesario tener experiencia previa en programación para empezar. El módulo de introducción está diseñado para principiantes, aunque tener conocimientos básicos te ayudará a avanzar más rápido en los módulos técnicos. Ofrecemos recursos adicionales para quienes necesiten fortalecer estas habilidades."
            />
            
            <FAQItem 
              question="¿Cuál es el compromiso de tiempo?"
              answer="El curso está diseñado para adaptarse a tu ritmo. Recomendamos dedicar al menos 5-7 horas semanales para obtener el máximo beneficio. Los módulos están estructurados en lecciones cortas que puedes completar según tu disponibilidad, y tendrás acceso permanente al contenido para revisarlo cuando lo necesites."
            />
            
            <FAQItem 
              question="¿Y si no es para mí?"
              answer="Ofrecemos una garantía de satisfacción de 14 días. Si después de probar el contenido sientes que no se ajusta a tus expectativas o necesidades, puedes solicitar un reembolso completo sin preguntas. Queremos que estés completamente seguro de tu inversión en aprendizaje."
            />
            
            <FAQItem 
              question="¿Qué tipo de soporte está disponible?"
              answer="Contarás con múltiples niveles de soporte: acceso a una comunidad exclusiva donde podrás conectar con otros estudiantes, sesiones grupales de resolución de dudas semanales, y la posibilidad de programar sesiones individuales de mentoría. Nuestro equipo responde a las preguntas técnicas en un plazo máximo de 24 horas."
            />
            
            <FAQItem 
              question="¿Qué puedo construir después de unirme?"
              answer="Al finalizar el curso, serás capaz de desarrollar agentes IA completos para automatizar tareas, crear asistentes especializados para tu industria, implementar soluciones de procesamiento de lenguaje natural, y construir aplicaciones que integren múltiples servicios de IA. Cada módulo incluye proyectos prácticos que fortalecerán tu portfolio."
            />
          </div>
        </div>
        
        {/* Espaciador adicional para resolver el problema de color con el footer */}
        <div className="h-16"></div>
      </div>
    </section>
  );
}
