"use client";

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import subscriptionService from '@/services/subscription';

interface RequiredSubscriptionModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const RequiredSubscriptionModal: React.FC<RequiredSubscriptionModalProps> = ({
  isOpen,
  onSuccess,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartSubscription = async () => {
    setIsLoading(true);
    setError('');

    try {
      // URLs de retorno para Stripe
      const successUrl = `${window.location.origin}/comunidad`;
      const cancelUrl = `${window.location.origin}/perfil/configuracion?required=true`;
      
      // Crear sesión de checkout
      const session = await subscriptionService.createCheckoutSession(successUrl, cancelUrl);
      
      // Redirigir a la página de checkout de Stripe
      if (session && session.checkout_url) {
        window.location.href = session.checkout_url;
      } else {
        throw new Error("No se obtuvo una URL de checkout válida");
      }
    } catch (err) {
      console.error('Error starting subscription:', err);
      setError('Error al iniciar el proceso de suscripción. Inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Este es un modal obligatorio, no se puede cerrar
  const handleBack = () => {
    router.push('/perfil');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white py-3 text-center font-medium z-[100]">
        Para acceder a la comunidad, debes activar tu suscripción
      </div>
      
      <div 
        className="relative bg-[#323230] p-6 rounded-lg w-full max-w-lg mx-4 md:mx-auto shadow-xl border border-white/10 mt-12"
        role="dialog"
        aria-labelledby="subscription-dialog-title"
      >
        <h2 id="subscription-dialog-title" className="text-2xl font-bold text-white mb-6">Suscríbete para continuar</h2>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-[#252524] rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Suscripción premium</h3>
          <p className="text-zinc-300 mb-4">
            Para acceder a nuestra comunidad y a todos los recursos exclusivos, es necesario activar tu suscripción mensual.
          </p>
          
          <div className="bg-[#323230] rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-2xl font-bold text-white">20€</span>
                <span className="text-zinc-400 ml-1">/ mes</span>
              </div>
              <span className="text-green-400 text-sm font-medium">Cancela cuando quieras</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-green-400 mt-0.5">✓</div>
              <p className="text-zinc-300">Acceso completo a la comunidad</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-green-400 mt-0.5">✓</div>
              <p className="text-zinc-300">Recursos exclusivos</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-green-400 mt-0.5">✓</div>
              <p className="text-zinc-300">Soporte personalizado</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-green-400 mt-0.5">✓</div>
              <p className="text-zinc-300">Acceso a todos los cursos</p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleStartSubscription}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            {isLoading ? 'Procesando...' : 'Suscribirme ahora'}
          </Button>
          
          <p className="text-zinc-500 text-sm mt-4 text-center">
            Pago seguro procesado por Stripe. Puedes cancelar en cualquier momento.
          </p>
        </div>
        
        <div className="flex justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="border-white/20 text-zinc-300 hover:text-white hover:bg-[#444442]"
          >
            Volver a mi perfil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequiredSubscriptionModal;
