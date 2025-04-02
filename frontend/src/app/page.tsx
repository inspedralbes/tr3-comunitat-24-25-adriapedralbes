"use client";

import { useEffect } from "react";

import { Footer } from "@/components/footer-component";
import { ActivityNotifications } from "@/components/Newsletter/activity-notifications";
import { NewsletterBenefits } from "@/components/Newsletter/benefits/newsletter-benefits";
import { NewsletterCommunity } from "@/components/Newsletter/community/newsletter-community";
import { NewsletterCourses } from "@/components/Newsletter/courses/newsletter-courses";
import { NewsletterGifts } from "@/components/Newsletter/gifts/newsletter-gifts";
import { NewsletterHero } from "@/components/Newsletter/hero/newsletter-hero";
import { NewsletterPricing } from "@/components/Newsletter/pricing/newsletter-pricing";
import { NewsletterSkills } from "@/components/Newsletter/skills/newsletter-skills";
import { MarqueeDemo } from "@/components/testimonials";

export default function Home() {
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

    // Asegurar que al cargar la página, solo se vea la sección hero
    document.body.style.overflow = 'hidden';
    
    // Después de 1 segundo, restaurar el scroll
    const timer = setTimeout(() => {
      document.body.style.overflow = '';
    }, 1000);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Nueva estructura con waitlist */}
      <NewsletterHero />

      {/* Pricing Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#080604] z-0"></div>
        <NewsletterPricing />
      </div>

      {/* Benefits Section */}
      <section id="benefits" className="mt-0 bg-[#0a0a0a]">
        <NewsletterBenefits />
      </section>

      {/* Community Section */}
      <NewsletterCommunity />

      {/* Skills Section */}
      <NewsletterSkills />

      {/* Free Gifts Section */}
      <NewsletterGifts />
      


      {/* Testimonials Marquee */}
      <section className="relative w-full overflow-hidden bg-[#0a0a0a] pt-4 pb-16">
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="h-full w-full bg-gradient-to-r from-[#C9A880]/20 to-[#C9A880]/10 blur-[120px]" />
        </div>
        <MarqueeDemo />
      </section>
      
      {/* Cursos IA Section */}
      <NewsletterCourses />

      {/* Spacer */}
      <div className="h-16 bg-[#0a0a0a]"></div>

      {/* Footer */}
      <Footer />
      
      {/* Notificaciones de actividad reciente */}
      <ActivityNotifications />
    </div>
  );
}