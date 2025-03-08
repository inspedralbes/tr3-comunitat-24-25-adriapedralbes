"use client";

import { useEffect, useState } from "react";
import { Users, Star, Mail, Share2 } from "lucide-react";

export function NewsletterStats() {
  // Para la animación de conteo
  const [counts, setCounts] = useState({
    readers: 0,
    rating: 0,
    newsletters: 0,
    shares: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts(prev => ({
        readers: Math.min(prev.readers + 5000, 100000),
        rating: Math.min(prev.rating + 0.2, 4.9),
        newsletters: Math.min(prev.newsletters + 10, 200),
        shares: Math.min(prev.shares + 80, 1600)
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      icon: <Users className="w-6 h-6 text-blue-400" />,
      label: "Lectores semanales",
      value: `+${counts.readers.toLocaleString()}`
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-400" />,
      label: "Valoración",
      value: `${counts.rating.toFixed(1)}/5`
    },
    {
      icon: <Mail className="w-6 h-6 text-purple-400" />,
      label: "Newsletters enviadas",
      value: `+${counts.newsletters}`
    },
    {
      icon: <Share2 className="w-6 h-6 text-green-400" />,
      label: "Noticias compartidas",
      value: `+${counts.shares.toLocaleString()}`
    }
  ];

  return (
    <section className="py-12 relative overflow-hidden">
      {/* Efecto de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-black opacity-80"></div>
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.8),transparent)]"></div>
      
      {/* Blur circles */}
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-md text-white rounded-xl p-6 border border-white/5 shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-800/80 rounded-lg">
                {stat.icon}
              </div>
              <div>
                <p className="font-bold uppercase text-xs text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
