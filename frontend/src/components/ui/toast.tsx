"use client";

import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

// Extend Window interface to include toast property
interface ToastFunctions {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

declare global {
  interface Window {
    toast?: ToastFunctions;
  }
}

// Helper functions para acceder a la API global de toast
export const toast = {
  success: (message: string) => {
    if (typeof window !== 'undefined' && window.toast) {
      window.toast.success(message);
    }
  },
  error: (message: string) => {
    if (typeof window !== 'undefined' && window.toast) {
      window.toast.error(message);
    }
  },
  warning: (message: string) => {
    if (typeof window !== 'undefined' && window.toast) {
      window.toast.warning(message);
    }
  },
  info: (message: string) => {
    if (typeof window !== 'undefined' && window.toast) {
      window.toast.info(message);
    }
  }
};

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export const Toast = ({ message, type = 'info', duration = 5000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Esperar a que termine la animación
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Determinar el icono y color según el tipo
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: <CheckCircle size={20} />, bgColor: 'bg-green-900', borderColor: 'border-green-500' };
      case 'error':
        return { icon: <X size={20} />, bgColor: 'bg-red-900', borderColor: 'border-red-500' };
      case 'warning':
        return { icon: <AlertTriangle size={20} />, bgColor: 'bg-yellow-900', borderColor: 'border-yellow-500' };
      case 'info':
      default:
        return { icon: <Info size={20} />, bgColor: 'bg-blue-900', borderColor: 'border-blue-500' };
    }
  };

  const { icon, bgColor, borderColor } = getIconAndColor();

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg border ${borderColor} ${bgColor} text-white transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="mr-3">{icon}</div>
      <div className="mr-8 max-w-xs">{message}</div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="text-white hover:text-gray-300 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Componente controlador para mostrar toasts en toda la aplicación
export const ToastProvider = () => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

  // Función para agregar un nuevo toast
  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  // Función para quitar un toast
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Exponemos las funciones al contexto global
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.toast = {
        success: (message: string) => addToast(message, 'success'),
        error: (message: string) => addToast(message, 'error'),
        warning: (message: string) => addToast(message, 'warning'),
        info: (message: string) => addToast(message, 'info'),
      };
    }
  }, []);

  return (
    <>
      {toasts.map(({ id, message, type }) => (
        <Toast
          key={id}
          message={message}
          type={type}
          onClose={() => removeToast(id)}
        />
      ))}
    </>
  );
};

export default ToastProvider;
