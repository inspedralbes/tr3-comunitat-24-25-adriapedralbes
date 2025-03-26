import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, Children, isValidElement } from 'react';

interface TooltipProviderProps {
  children: React.ReactNode;
  _delayDuration?: number;
}

const TooltipProvider: React.FC<TooltipProviderProps> = ({ 
  children,
  _delayDuration = 300 
}) => {
  return <>{children}</>;
};

interface TooltipProps {
  children: React.ReactNode;
  _delayDuration?: number;
  _open?: boolean;
  _onOpenChange?: (open: boolean) => void;
}

const TooltipComponent: React.FC<TooltipProps> = ({
  children,
  _delayDuration,
  _open: _controlledOpen,
  _onOpenChange
}) => {
  return <>{children}</>;
};

interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ 
  children,
  asChild = false,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Aplicamos un enfoque más simple para evitar problemas de tipado
  if (asChild && Children.only(children) && isValidElement(children)) {
    // Si es asChild, creamos un clon con las props necesarias
    return (
      <span 
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        data-state={isOpen ? 'open' : 'closed'}
        data-tooltip-trigger="true"
      >
        {children}
      </span>
    );
  }
  
  // Si no es asChild, simplemente envolvemos en un span
  return (
    <span 
      className={className}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      data-state={isOpen ? 'open' : 'closed'}
      data-tooltip-trigger="true"
    >
      {children}
    </span>
  );
};

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
  sideOffset?: number;
  _alignOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  _align?: 'start' | 'center' | 'end';
}

const TooltipContent: React.FC<TooltipContentProps> = ({ 
  children,
  className,
  sideOffset = 5,
  _alignOffset = 0,
  side = 'top',
  _align = 'center'
}) => {
  // Comprobamos el estado del trigger padre
  const isOpen = (document.querySelector('[data-tooltip-trigger][data-state="open"]') !== null);
  
  const getPosition = () => {
    const trigger = document.querySelector('[data-tooltip-trigger][data-state="open"]');
    if (!trigger) return { top: 0, left: 0 };
    
    const rect = (trigger as HTMLElement).getBoundingClientRect();
    
    // Posicionamiento según 'side' y 'align'
    switch (side) {
      case 'top':
        return {
          top: rect.top - sideOffset,
          left: rect.left + rect.width / 2
        };
      case 'bottom':
        return {
          top: rect.bottom + sideOffset,
          left: rect.left + rect.width / 2
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - sideOffset
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + sideOffset
        };
      default:
        return {
          top: rect.top - sideOffset,
          left: rect.left + rect.width / 2
        };
    }
  };
  
  const position = getPosition();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`fixed z-50 px-3 py-1.5 text-sm bg-black/80 dark:bg-white/80 text-white dark:text-black rounded-md shadow-md ${className || ''}`}
          style={{
            top: position.top,
            left: position.left,
            transform: 'translate(-50%, -100%)',
            maxWidth: 'calc(100vw - 20px)'
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Para usar como componente compuesto
type TooltipType = React.FC<TooltipProps> & {
  Provider: typeof TooltipProvider;
  Trigger: typeof TooltipTrigger;
  Content: typeof TooltipContent;
};

const Tooltip = TooltipComponent as TooltipType;
Tooltip.Provider = TooltipProvider;
Tooltip.Trigger = TooltipTrigger;
Tooltip.Content = TooltipContent;

export { 
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent
};