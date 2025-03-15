import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfettiExplosion } from '@/components/ui/confetti';
import { Sparkles, Award, Star, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LevelUpNotificationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  oldLevel: number;
  newLevel: number;
  newTitle?: string;
}

export default function LevelUpNotification({
  isOpen,
  onOpenChange,
  oldLevel,
  newLevel,
  newTitle = `Nivel ${newLevel}`
}: LevelUpNotificationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Mostrar confeti cuando se abre la notificación
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      
      // Ocultar confeti después de unos segundos
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Determinar el color de fondo según el nivel
  const getBadgeColor = (level: number) => {
    const colors: Record<number, string> = {
      1: 'bg-gray-500',
      2: 'bg-green-500',
      3: 'bg-blue-500',
      4: 'bg-indigo-500',
      5: 'bg-purple-500',
      6: 'bg-pink-500',
      7: 'bg-red-500',
      8: 'bg-yellow-500',
      9: 'bg-amber-500',
      10: 'bg-orange-500',
    };
    return colors[level] || 'bg-blue-500';
  };
  
  // Íconos para diferentes rangos de nivel
  const getLevelIcon = (level: number) => {
    if (level >= 8) return <Trophy className="h-8 w-8 text-yellow-400" />;
    if (level >= 5) return <Award className="h-8 w-8 text-purple-400" />;
    return <Star className="h-8 w-8 text-blue-400" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-gray-900 to-zinc-900 border-none text-white max-w-sm mx-auto relative overflow-hidden p-0">
        {/* Efecto de confeti */}
        {showConfetti && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <ConfettiExplosion 
              force={0.8}
              duration={3000}
              particleCount={100}
              width={1600}
            />
          </div>
        )}
        
        {/* Fondo con efecto de brillo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
        
        {/* Brillos animados */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence>
            {Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0, x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%` }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0.5],
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`
                }}
                transition={{ 
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay: index * 0.5
                }}
                className="absolute w-12 h-12 rounded-full bg-blue-400/20 blur-xl"
              />
            ))}
          </AnimatePresence>
        </div>
        
        <div className="relative z-10 pt-8">
          <DialogHeader className="text-center mb-4">
            <DialogTitle className="text-2xl sm:text-3xl font-bold flex flex-col items-center">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-2"
              >
                ¡Has subido de nivel!
              </motion.div>
              
              <div className="flex items-center gap-4 mt-6">
                {/* Nivel anterior */}
                <div className="text-center opacity-60">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto",
                    getBadgeColor(oldLevel)
                  )}>
                    {oldLevel}
                  </div>
                  <p className="mt-1 text-sm">Anterior</p>
                </div>
                
                {/* Flecha animada */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Sparkles className="h-8 w-8 text-yellow-400" />
                </motion.div>
                
                {/* Nuevo nivel con animación */}
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
                >
                  <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto border-4 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.3)]",
                    getBadgeColor(newLevel)
                  )}>
                    {newLevel}
                  </div>
                  <p className="mt-2 font-medium">{newTitle}</p>
                </motion.div>
              </div>
            </DialogTitle>
            
            <DialogDescription className="text-gray-200 text-center mt-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                Continúa participando en la comunidad para desbloquear más niveles y funcionalidades.
              </motion.div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center my-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="p-4 bg-blue-600/20 rounded-lg border border-blue-500/30 max-w-xs text-center"
            >
              <div className="flex justify-center mb-2">
                {getLevelIcon(newLevel)}
              </div>
              <p className="text-sm text-blue-200">
                {getAchievementText(newLevel)}
              </p>
            </motion.div>
          </div>
          
          <DialogFooter className="sm:justify-center pb-8">
            <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-lg">
              ¡Genial!
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Mensajes motivacionales según el nivel
function getAchievementText(level: number): string {
  switch (level) {
    case 2:
      return "Has pasado de Novato a Aprendiz. Continúa participando en la comunidad y compartiendo tu conocimiento.";
    case 3:
      return "¡Felicidades por alcanzar el nivel de Participante! Tu constancia está dando frutos.";
    case 4:
      return "¡Te has convertido en Contribuidor! Tus aportes están enriqueciendo la comunidad.";
    case 5:
      return "¡Increíble! Has alcanzado el nivel de Experto. Tu dedicación es notable.";
    case 6:
      return "¡Ahora eres Especialista! Tu conocimiento y experiencia son muy valiosos para todos.";
    case 7:
      return "¡Felicidades por llegar a Maestro! Tu influencia en la comunidad es cada vez mayor.";
    case 8:
      return "¡Asombroso! Te has convertido en Gurú, uno de los miembros más respetados.";
    case 9:
      return "¡Eres una Leyenda en la comunidad! Tu compromiso es realmente inspirador.";
    case 10:
      return "¡Nivel Visionario alcanzado! Has llegado a la cima y eres un referente para todos.";
    default:
      return "¡Felicidades por tu nuevo nivel! Continúa participando activamente.";
  }
}