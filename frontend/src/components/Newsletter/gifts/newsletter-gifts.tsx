"use client";

import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";

export function NewsletterGifts() {
  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Título centrado */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Your <span className="bg-gradient-to-r from-[#C2A57C] to-[#D4B68E] bg-clip-text text-transparent">Guide</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-16">
          {/* Columna de texto */}
          <div className="md:w-1/2">
            <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10">
              <p className="mb-8 text-gray-300 text-lg">
                Nice to meet you! I'm Cole Medin – a tech enthusiast, software developer, and entrepreneur with over five years dedicated to mastering AI, particularly generative AI and AI agents. With a YouTube channel that's grown to over 100,000 subscribers, I've helped thousands build and leverage AI to tackle real-world problems.
              </p>

              <p className="mb-6 text-gray-300 text-lg">
                My journey includes working as a software developer for a Fortune 500 company and consulting with numerous startups, guiding their AI strategies and integration. I've seen firsthand the immense potential—and pitfalls—of AI, equipping me to deliver practical, actionable insights that can transform your skills and your business.
              </p>
            </div>
          </div>

          {/* Columna de imagen */}
          <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
            <div className="relative w-72 h-80 md:w-96 md:h-[28rem] overflow-hidden rounded-xl border-2 border-[#C2A57C]">
              {/* Efecto de luz detrás de la imagen */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#C2A57C]/50 to-[#D4B68E]/30 opacity-60"></div>
              
              {/* Imagen */}
              <Image 
                src="/adria.jpg" 
                alt="Cole Medin" 
                width={500}
                height={600}
                className="w-full h-full object-cover"
                unoptimized={true}
              />
              
              {/* Efecto de código en el fondo */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
