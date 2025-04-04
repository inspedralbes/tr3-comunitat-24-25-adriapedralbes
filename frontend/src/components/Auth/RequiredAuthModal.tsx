"use client";

import { useState } from 'react';

import { AuthModal, AuthModalType } from './AuthModal';

interface RequiredAuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const RequiredAuthModal: React.FC<RequiredAuthModalProps> = ({
  isOpen,
  onSuccess,
}) => {
  // En este modal no hacemos nada en onClose porque es obligatorio completar el proceso
  const handleClose = () => {
    // No hacer nada, el usuario debe autenticarse
    console.log('Intento de cerrar modal obligatorio ignorado');
  };

  return (
    <div className="relative z-50">
      {/* Mensaje adicional para informar al usuario */}
      {isOpen && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white py-3 text-center font-medium z-[100]">
          Para acceder a la comunidad, debes iniciar sesión o crear una cuenta
        </div>
      )}
      
      {/* Modal de autenticación sin botón de cierre */}
      <AuthModal 
        isOpen={isOpen}
        type={AuthModalType.LOGIN}
        onClose={handleClose}
        onSuccess={onSuccess}
      />
    </div>
  );
};

export default RequiredAuthModal;
