"use client";

import Image from "next/image";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { useState } from "react";

import { AuthModal as _AuthModal, AuthModalType as _AuthModalType } from "@/components/Auth";
import { NewsletterAvatarCircles } from "@/components/Newsletter/newsletter-avatar-circles";
import { RainbowButtonDemo } from "@/components/rainbowButton";
import { Input } from "@/components/ui/input";

export function NewsletterHero() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [_showAuthModal, _setShowAuthModal] = useState(false);
  
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!email) {
      setErrorMessage("Por favor, introduce tu email");
      return;
    }
    
    if (!accepted) {
      setErrorMessage("Debes aceptar la política de privacidad");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Realizar solicitud directa al backend sin requerir autenticación
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      
      const response = await fetch(`${apiUrl}/newsletter/subscribe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ha ocurrido un error al procesar la suscripción');
      }
      
      setIsSuccess(true);
      setName("");
      setEmail("");
      setAccepted(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      console.error("Error:", error);
      setErrorMessage(errorMessage || "Ha ocurrido un error. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Logo 
            width={96}
            height={96}
            className="h-24 w-auto"
          />
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
          
          {errorMessage && (
            <div className="text-red-400 bg-red-500/20 p-3 rounded-lg text-sm text-center">
              {errorMessage}
            </div>
          )}
          
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
            {isSuccess ? (
              <div className="text-green-400 bg-green-400/20 p-4 rounded-lg">
                <p>¡Gracias por suscribirte! Por favor, revisa tu correo para confirmar tu suscripción.</p>
              </div>
            ) : (
              <RainbowButtonDemo 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "ENVIANDO..." : "UNIRME AHORA GRATIS"}
              </RainbowButtonDemo>
            )}
          </div>
        </div>
      </div>

      {/* Modal de autenticación ya no es necesario */}
      {/* Mantenemos el componente por si en el futuro se quiere usar para otras funcionalidades */}
    </section>
  );
}
