"use client";

// X no es utilizado
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authService } from '@/services/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToRegister
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Login and get token response
      const tokenResponse = await authService.login({ username, password });
      
      // Immediately fetch user profile to update state before redirect
      const userProfile = await authService.getProfile();
      
      // Call onSuccess only after we've retrieved the user profile
      onSuccess();
      
      // Give the UI a moment to update before reloading the page
      setTimeout(() => {
        // Recargar la página después del login para asegurar que el estado se actualiza completamente
        window.location.reload();
      }, 300);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Credenciales inválidas. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div 
        className="relative bg-[#323230] p-6 rounded-lg w-full max-w-md mx-4 md:mx-auto shadow-xl border border-white/10"
        role="dialog"
        aria-labelledby="login-dialog-title"
      >
        {/* Botón de cierre eliminado para forzar la autenticación */}

        <h2 id="login-dialog-title" className="text-2xl font-bold text-white mb-6">Iniciar sesión</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-1">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-[#444442] border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#444442] border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
              isLoading ? 'bg-blue-700/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-zinc-400 text-sm">
            ¿No tienes una cuenta?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Regístrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};