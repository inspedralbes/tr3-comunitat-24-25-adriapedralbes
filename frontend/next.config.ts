import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['via.placeholder.com', 'github.com', 'futurprive.com', 'i.pravatar.cc', 'randomuser.me'], // Dominios permitidos para las imágenes
  },
  experimental: {
    // Esta configuración evita advertencias con params en componentes cliente
    // pero lo hacemos de forma compatible con tipos de TS
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;