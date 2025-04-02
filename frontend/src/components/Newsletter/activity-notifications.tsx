"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function ActivityNotifications() {
  const [notification, setNotification] = useState<string | null>(null);
  
  useEffect(() => {
    // Mostrar notificación después de 3 segundos de cargar la página
    const timeout = setTimeout(() => {
      setNotification("Solo quedan 67 plazas disponibles");
      
      // Ocultar después de 10 segundos
      setTimeout(() => {
        setNotification(null);
      }, 10000);
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-xs">
      <AnimatePresence>
        {notification && (
          <motion.div 
            className="bg-gradient-to-r from-[#161310] to-[#0a0806] border border-[#C9A880]/30 shadow-lg rounded-xl p-4 flex items-center"
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Indicador animado */}
            <span className="relative flex h-3 w-3 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A880] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C9A880]"></span>
            </span>
            
            {/* Mensaje */}
            <p className="text-white/90 text-sm">{notification}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
