"use client";

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

import { ProfileConfigurationModal } from '@/components/Profile/ProfileConfigurationModal';
import { UserProfile, authService } from '@/services/auth';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToLogin
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileConfig, setShowProfileConfig] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (password !== password2) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.register({
        username,
        email,
        password,
        password2,
        first_name: firstName,
        last_name: lastName
      });
      
      // Guardar el perfil del usuario para el modal de configuración
      setUserProfile(result);
      
      // Si el registro es exitoso, iniciar sesión automáticamente
      await authService.login({ username, password });
      
      // Mostrar el modal de configuración en lugar de llamar a onSuccess
      setShowProfileConfig(true);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Error al registrar. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Función para manejar el éxito en la configuración del perfil
  const handleProfileConfigSuccess = () => {
    setShowProfileConfig(false);
    onSuccess();
    // Recargar la página para asegurar que todos los datos se actualizan
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };
  
  // Función para cerrar el modal de configuración
  const handleProfileConfigClose = () => {
    setShowProfileConfig(false);
    onSuccess();
    // Recargar la página para asegurar que todos los datos se actualizan
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };
  
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div 
          className="relative bg-[#323230] p-6 rounded-lg w-full max-w-md mx-4 md:mx-auto shadow-xl border border-white/10 max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-labelledby="register-dialog-title"
        >
          {/* Botón de cierre eliminado para forzar el registro */}

          <h2 id="register-dialog-title" className="text-2xl font-bold text-white mb-6">Crear cuenta</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-1">
                Usuario *
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

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#444442] border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-zinc-300 mb-1">
                  Nombre
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#444442] border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-zinc-300 mb-1">
                  Apellido
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#444442] border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1">
                Contraseña *
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

            <div className="mb-6">
              <label htmlFor="password2" className="block text-sm font-medium text-zinc-300 mb-1">
                Confirmar Contraseña *
              </label>
              <input
                id="password2"
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
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
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-zinc-400 text-sm">
              ¿Ya tienes una cuenta?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {showProfileConfig && userProfile && (
        <ProfileConfigurationModal
          userProfile={userProfile}
          isOpen={showProfileConfig}
          onClose={handleProfileConfigClose}
          onSuccess={handleProfileConfigSuccess}
        />
      )}
    </>
  );
};