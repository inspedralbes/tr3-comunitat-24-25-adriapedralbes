"use client";

import { Footer } from "@/components/footer-component";
import { NewsletterHero } from "@/components/Newsletter/hero/newsletter-hero";
import { NewsletterStats } from "@/components/Newsletter/stats/newsletter-stats";
import { NewsletterBenefits } from "@/components/Newsletter/benefits/newsletter-benefits";
import { NewsletterGifts } from "@/components/Newsletter/gifts/newsletter-gifts";
import { NewsletterTestimonials } from "@/components/Newsletter/testimonials/newsletter-testimonials";
import { MarqueeDemo } from "@/components/testimonials";
import { useEffect } from "react";

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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <NewsletterHero />

      {/* Stats Section */}
      <NewsletterStats />

      {/* Benefits Section */}
      <NewsletterBenefits />

      {/* Testimonials Marquee - Se ha eliminado el padding vertical en esta sección */}
      <section className="relative w-full overflow-hidden bg-[#0a0a0a] pt-0">
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="h-full w-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-[120px]" />
        </div>
        <MarqueeDemo />
      </section>

      {/* Free Gifts Section */}
      <NewsletterGifts />

      {/* Testimonials Section */}
      <NewsletterTestimonials />

      {/* Footer */}
      <Footer />
    </div>
  );
}
