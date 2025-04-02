import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AnimatedButton } from "@/components/animatedButton";
import { AvatarCirclesDemo } from "@/components/avatarCircles";
import { Footer } from "@/components/footer-component";
import { Logo } from "@/components/Logo";
import { MagicCardDemo } from "@/components/magicCard";
import { BentoDemo } from "@/components/our-services";
import { RainbowButtonDemo } from "@/components/rainbowButton";
import { MarqueeDemo } from "@/components/testimonials";
import { Button } from "@/components/ui/button";

export default function Consultoria() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
            <Logo 
              width={32} 
              height={32} 
              className="h-8 w-auto"
            />
            FuturPrive
          </Link>
        </div>
      </nav>

      <main className="relative px-6 py-16 text-center lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            {/* <DialogNewsletter /> */}
            <div className="flex flex-col items-center space-y-2">
              <AvatarCirclesDemo />
              <p className="text-[#C9A880] font-semibold text-sm">+100 empresas transformadas</p>
            </div>
          </div>
          {/* Heading */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight lg:text-5xl">
            Soluciones IA personalizadas. <br /> Reducen Costes y Maximizan{" "}
            <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">
              Beneficio
            </span>
          </h1>

          {/* Subtitle - Simplificado */}
          <p className="mb-8 text-lg text-gray-400">
            Agenda tu consultoría gratuita y descubre cómo impulsar tu negocio
          </p>

          {/* CTA Button */}
          <Button
            variant="white"
            size="lg"
            className="gap-2 font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 btn-blink"
            asChild
          >
            <Link href="https://cal.com/futurprive/consultoria-gratis">
              Agenda tu Consultoría Gratuita Ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Testimonials section con transición suave desde el main, ocupando todo el ancho */}
      <section className="relative w-full overflow-hidden -mt-12 md:-mt-16 bg-[#0a0a0a]">
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="h-full w-full bg-gradient-to-r from-[#C9A880]/20 to-[#C9A880]/10 blur-[120px]" />
        </div>
        <div className="text-center pb-0 mb-0 mt-8">
          <AnimatedButton>Testimonios</AnimatedButton>
        </div>
        <div className="mt-[-20px]">
          <MarqueeDemo />
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] text-center pt-16">
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
          <Link href="https://cal.com/futurprive/consultoria-gratis" className="block">
            <div className="btn-blink inline-block rounded-xl overflow-hidden">
              <RainbowButtonDemo>
                Agenda tu Consultoría Gratuita Ahora
              </RainbowButtonDemo>
            </div>
          </Link>
        </div>
      </section>
      <section>
        <Footer />
      </section>
    </div>
  );
}