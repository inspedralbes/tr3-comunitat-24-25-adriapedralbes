"use client";

import { useState } from 'react';

import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';

export enum AuthModalType {
  LOGIN = 'login',
  REGISTER = 'register',
}

interface AuthModalProps {
  isOpen: boolean;
  type: AuthModalType;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  type: initialType,
  onClose,
  onSuccess,
}) => {
  const [currentType, setCurrentType] = useState<AuthModalType>(initialType);

  const switchToLogin = () => {
    setCurrentType(AuthModalType.LOGIN);
  };

  const switchToRegister = () => {
    setCurrentType(AuthModalType.REGISTER);
  };

  if (!isOpen) return null;

  return (
    <>
      {currentType === AuthModalType.LOGIN ? (
        <LoginModal
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={onSuccess}
          onSwitchToRegister={switchToRegister}
        />
      ) : (
        <RegisterModal
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={onSuccess}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </>
  );
};