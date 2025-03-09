"use client";

import { useEffect } from "react";

import { Footer } from "@/components/footer-component";
import { NewsletterBenefits } from "@/components/Newsletter/benefits/newsletter-benefits";
import { NewsletterGifts } from "@/components/Newsletter/gifts/newsletter-gifts";
import { NewsletterHero } from "@/components/Newsletter/hero/newsletter-hero";
import { NewsletterTestimonials } from "@/components/Newsletter/testimonials/newsletter-testimonials";
import { MarqueeDemo } from "@/components/testimonials";

export default function NewsletterPage() {
  // Implementar scroll suave para los enlaces de anclaje
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = anchor.getAttribute('href')?.replace('#', '');
        const targetElement = document.getElementById(targetId || '');

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop,
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <NewsletterHero />

      {/* Benefits Section */}
      <NewsletterBenefits />

      {/* Testimonials Marquee - Se ha eliminado el padding vertical en esta sección */}
      <section className="relative w-full overflow-hidden bg-[#0a0a0a] pt-0">
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="h-full w-full bg-gradient-to-r from-[#C9A880]/20 to-[#C9A880]/10 blur-[120px]" />
        </div>
        <MarqueeDemo />
      </section>

      {/* Free Gifts Section */}
      <NewsletterGifts />

      {/* Testimonials Section - mejorado para mejor visibilidad */}
      <section className="py-16 bg-black border-t border-[#C9A880]/10">
        <NewsletterTestimonials />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
