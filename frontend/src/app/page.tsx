import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { AnimatedButton } from "@/components/animatedButton";
import { DialogNewsletter } from "@/components/dialogButton";
import { Footer } from "@/components/footer-component";
import { MagicCardDemo } from "@/components/magicCard";
import { BentoDemo } from "@/components/our-services";
import { RainbowButtonDemo } from "@/components/rainbowButton";
import { Button } from "@/components/ui/button";
import { VideoPresentation } from "@/components/video-presentation";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-semibold">
            FuturPrive
          </Link>
        </div>
      </nav>

      <main className="relative px-6 py-16 text-center lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          {/* Badge */}
          <div className="flex justify-center mb-3">
            <DialogNewsletter />
          </div>
          {/* Heading */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight lg:text-5xl">
            Soluciones IA personalizadas. <br /> Reducen Costes y Maximizan{" "}
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Beneficio
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-lg text-gray-400">
            ¿Listo para impulsar tu proyecto con tecnología?
            <br />
            Agenda tu consultoría gratuita ahora y te mostraremos cómo.
          </p>

          {/* CTA Button */}
          <Button
            variant="white"
            size="lg"
            className="gap-2 font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300"
            asChild
          >
            <Link href="/comunidad">
              Agenda tu Consultoría Gratuita Ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {/* Dashboard Preview */}
          <div className="relative mt-16">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-[500px] w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-[100px]" />
            </div>
            {/* Añadir aqui */}
            <VideoPresentation />
          </div>
        </div>
      </main>
      <section className="mx-auto max-w-[1400px] text-center">
        <AnimatedButton>Tendencias</AnimatedButton>
        <div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-5xl">
            Nuestros Servicios
          </h1>
          <p className="mt-5 text-lg text-gray-400">
            Acompañamos a tu proyecto en la implementación, desarrollo de
            tecnologías IA y soluciones de automatización, <br />
            asegurando una transición fluida desde inicio hasta el despliegue y
            el logro de resultados tangibles.
          </p>
        </div>
        <BentoDemo />
      </section>

      <section className="mx-auto max-w-[1400px] text-center py-20 px-4">
        <AnimatedButton>Proceso</AnimatedButton>
        <div className="mb-16">
          <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-5xl">
            Soluciones a medida <br />
            en 3 pasos
          </h1>
          <p className="mt-5 text-lg text-gray-400">
            Agenda tu llamada, obten recomendación y recibe tu solución.
            <br />
            Nuestro equipo de expertos te acompañará en cada paso.
          </p>
        </div>
        <MagicCardDemo />
        <div className="mt-14">
          <RainbowButtonDemo>
            Agenda tu Consultoría Gratuita Ahora
          </RainbowButtonDemo>
        </div>
      </section>
      <section>
        <Footer />
      </section>
    </div>
  );
}
