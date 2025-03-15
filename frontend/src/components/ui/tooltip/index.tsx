import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ 
  children,
  delayDuration = 300 
}) => {
  return <>{children}</>;
};

interface TooltipProps {
  children: React.ReactNode;
  delayDuration?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  delayDuration,
  open: controlledOpen,
  onOpenChange
}) => {
  return <>{children}</>;
};

interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ 
  children,
  asChild = false,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const child = asChild 
    ? React.Children.only(children) 
    : <span className={className}>{children}</span>;
  
  return React.cloneElement(child as React.ReactElement, {
    onMouseEnter: () => setIsOpen(true),
    onMouseLeave: () => setIsOpen(false),
    'data-state': isOpen ? 'open' : 'closed',
    'data-tooltip-trigger': true,
    className: [
      (child as React.ReactElement).props.className,
      className
    ].filter(Boolean).join(' ')
  });
};

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
  sideOffset?: number;
  alignOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export const TooltipContent: React.FC<TooltipContentProps> = ({ 
  children,
  className,
  sideOffset = 5,
  alignOffset = 0,
  side = 'top',
  align = 'center'
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
Tooltip.Provider = TooltipProvider;
Tooltip.Trigger = TooltipTrigger;
Tooltip.Content = TooltipContent;

export { 
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent
};