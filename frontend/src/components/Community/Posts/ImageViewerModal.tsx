import { X } from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useEffect } from 'react';

import { normalizeImageUrl } from '@/utils/imageUtils';

interface ImageViewerModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  altText?: string;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  imageUrl,
  isOpen,
  onClose,
  altText = 'Imagen a tamaño completo'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera del modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        event.stopPropagation(); // Detener la propagación del evento
        onClose();
      }
    };

    // Solo agregar listener si el modal está abierto
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation(); // Detener la propagación del evento
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/85 z-[60] flex items-center justify-center p-4 overflow-hidden" 
      role="dialog"
      aria-modal="true"
      aria-label="Visor de imagen"
    >
      <div ref={modalRef} className="relative max-w-5xl max-h-[90vh] w-full">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Detener la propagación
            onClose();
          }}
          className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full p-1 transition-colors z-10"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>
        
        <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg" role="presentation">
          <button 
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            className="bg-transparent border-0 p-0 cursor-default focus:outline-none"
            aria-label="Ver imagen"
          >
            <Image
              src={normalizeImageUrl(imageUrl) || '/placeholder-image.png'}
              alt={altText}
              width={1200}
              height={800}
              className="max-h-[85vh] object-contain"
              priority={true}
              unoptimized={true}
            />
          </button>
        </div>
      </div>
    </div>
  );
};