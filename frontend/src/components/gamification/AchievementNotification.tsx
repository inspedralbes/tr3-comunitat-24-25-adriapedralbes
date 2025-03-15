import React, { useState, useEffect } from 'react';
// Usamos componentes simples en lugar de importar de @/components/ui/toast
// Definición simplificada de los componentes de toast
import { AnimatePresence, motion } from "framer-motion";

const Toast = ({ className, style, children }: any) => (
  <div className={`bg-white dark:bg-gray-800 rounded-md shadow-md p-4 ${className || ''}`} style={style}>{children}</div>
);

const ToastTitle = ({ className, children }: any) => (
  <div className={`font-semibold text-black dark:text-white ${className || ''}`}>{children}</div>
);

const ToastDescription = ({ className, children }: any) => (
  <div className={`text-gray-700 dark:text-gray-300 ${className || ''}`}>{children}</div>
);

const ToastProvider = ({ children }: any) => <>{children}</>;
const ToastViewport = ({ className, children }: any) => <div className={className}>{children}</div>;

// Interfaces para los tipos de notificaciones
export interface LevelUpNotification {
  type: 'level-up';
  oldLevel: number;
  newLevel: number;
  levelInfo: {
    title: string;
    description?: string;
    badge_color: string;
    icon?: string;
  }
}

export interface AchievementUnlockNotification {
  type: 'achievement';
  name: string;
  description: string;
  points_reward: number;
  badge_color: string;
  icon?: string;
}

export type GamificationNotification = LevelUpNotification | AchievementUnlockNotification;

interface AchievementNotificationProps {
  notification: GamificationNotification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Componente de notificación de logro
const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  notification,
  open,
  onOpenChange
}) => {
  // Cerrar automáticamente después de un tiempo
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  if (!notification) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          <Toast className="min-w-[350px] border-l-4 shadow-lg" 
            style={{ borderLeftColor: getBorderColor(notification) }}
          >
            <div className="flex items-start gap-3">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${getBadgeColor(notification)}`}
              >
                {getIcon(notification)}
              </div>
              <div className="flex-1">
                <ToastTitle className="mb-1 flex gap-2 items-center">
                  {notification.type === 'level-up' ? (
                    <>¡Has subido de nivel!</>
                  ) : (
                    <>¡Logro desbloqueado!</>
                  )}
                </ToastTitle>
                <ToastDescription className="text-sm">
                  {notification.type === 'level-up' ? (
                    <>
                      <div className="font-medium">
                        Nivel {notification.newLevel}: {notification.levelInfo.title}
                      </div>
                      {notification.levelInfo.description && (
                        <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                          {notification.levelInfo.description}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="font-medium">{notification.name}</div>
                      <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                        {notification.description}
                      </div>
                      <div className="text-xs mt-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        +{notification.points_reward} puntos
                      </div>
                    </>
                  )}
                </ToastDescription>
              </div>
            </div>
          </Toast>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Función para obtener el color del borde
const getBorderColor = (notification: GamificationNotification) => {
  if (notification.type === 'level-up') {
    // Usar el color de badge de levelInfo para nivel
    const bgColor = notification.levelInfo.badge_color;
    
    if (bgColor.includes('green')) return '#10B981';
    if (bgColor.includes('blue')) return '#3B82F6';
    if (bgColor.includes('yellow')) return '#F59E0B';
    if (bgColor.includes('red')) return '#EF4444';
    if (bgColor.includes('purple')) return '#8B5CF6';
    
    return '#8B5CF6'; // Color violeta por defecto para subida de nivel
  }
  
  // Extraer el color del badge, buscamos el valor hexadecimal o devolvemos un color por defecto
  const bgColor = notification.badge_color;
  
  if (bgColor.includes('green')) return '#10B981';
  if (bgColor.includes('blue')) return '#3B82F6';
  if (bgColor.includes('yellow')) return '#F59E0B';
  if (bgColor.includes('red')) return '#EF4444';
  if (bgColor.includes('purple')) return '#8B5CF6';
  
  return '#3B82F6'; // Color por defecto
};

// Función para obtener el color del badge
const getBadgeColor = (notification: GamificationNotification) => {
  if (notification.type === 'level-up') {
    return notification.levelInfo.badge_color || 'bg-blue-500';
  }
  return notification.badge_color || 'bg-blue-500';
};

// Función para obtener el icono
const getIcon = (notification: GamificationNotification) => {
  if (notification.type === 'level-up') {
    return <span className="text-white">⭐</span>;
  }
  
  // Si hay un icono personalizado para el logro, usarlo
  if (notification.icon) {
    return <span className="text-white">{notification.icon}</span>;
  }
  
  // Icono por defecto para logros
  return <span className="text-white">🏆</span>;
};

// Proveedor de notificaciones de gamificación
export const GamificationNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      {children}
      <ToastViewport className="fixed bottom-0 right-0 flex flex-col gap-2 p-4 max-h-screen z-50" />
    </ToastProvider>
  );
};

export default AchievementNotification;
