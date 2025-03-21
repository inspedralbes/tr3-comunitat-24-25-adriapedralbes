"use client";

import { AvatarCirclesDemo } from "@/components/avatarCircles";

export function NewsletterStats() {
  return (
    <section className="py-12 relative overflow-hidden">
      {/* Efecto de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-black opacity-80"></div>
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.8),transparent)]"></div>
      
      {/* Blur circles */}
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#C9A880]/25 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#C9A880]/30 rounded-full blur-3xl"></div>
      
      <div className="relative flex flex-col items-center justify-center text-center max-w-6xl mx-auto px-4 py-8">
        <AvatarCirclesDemo />
        <p className="text-[#C9A880] font-semibold text-lg mt-4">+100 empresas transformadas con nuestra newsletter</p>
      </div>
    </section>
  );
}
