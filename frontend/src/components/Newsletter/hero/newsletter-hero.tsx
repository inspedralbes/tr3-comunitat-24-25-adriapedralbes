"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { RainbowButtonDemo } from "@/components/rainbowButton";
import { NewsletterAvatarCircles } from "@/components/Newsletter/newsletter-avatar-circles";

export function NewsletterHero() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);

  return (
    <section id="newsletter-form" className="relative min-h-[600px] flex items-center justify-center overflow-hidden pb-24">
      {/* Fondo oscuro con degradado */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      
      {/* Gradientes de colores */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-[#C9A880]/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C9A880]/25 rounded-full blur-3xl"></div>
      
      {/* Contenido */}
      <div className="relative z-20 text-center px-4 max-w-3xl mx-auto">
        <div className="flex justify-center mb-4">
          <img src="/logo_futurprive_sinfondo.png" alt="FuturPrive Logo" className="h-24 w-auto" />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
          Newsletter <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">FuturPrive</span>
        </h1>
        
        <h2 className="text-xl md:text-2xl lg:text-3xl font-medium mb-8 text-white">
          Mantente al día de las últimas tendencias en Inteligencia Artificial
        </h2>
        
        {/* Subscription Form */}
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-2xl border border-white/10 max-w-xl mx-auto space-y-4">
          <NewsletterAvatarCircles />
          
          <Input 
            type="text" 
            placeholder="Tu nombre" 
            className="w-full p-4 h-12 rounded-lg bg-white/10 text-white border-white/20 placeholder:text-white/60"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <Input 
            type="email" 
            placeholder="Tu mejor email" 
            className="w-full p-4 h-12 rounded-lg bg-white/10 text-white border-white/20 placeholder:text-white/60"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <div className="flex items-start space-x-2 text-left">
            <input 
              type="checkbox" 
              className="mt-1" 
              id="privacy"
              checked={accepted}
              onChange={() => setAccepted(!accepted)}
            />
            <label htmlFor="privacy" className="text-sm text-white/80">
              He leído y acepto la <Link href="#" className="text-[#C9A880] hover:underline">política de cookies</Link> y <Link href="#" className="text-[#C9A880] hover:underline">privacidad</Link>.
            </label>
          </div>
          
          <div className="pt-2">
            <RainbowButtonDemo>
              UNIRME AHORA GRATIS
            </RainbowButtonDemo>
          </div>
        </div>
      </div>
    </section>
  );
}
