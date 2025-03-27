"use client";

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import subscriptionService, { SubscriptionStatus } from '@/services/subscription';

import MainLayout from '@/components/layouts/MainLayout';
import { ProfileSettings } from '@/components/Profile/ProfileSettings';
import { RequiredSubscriptionModal } from '@/components/Subscription';
import { UserProfile, authService } from '@/services/auth';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const [isSubscriptionRequired, setIsSubscriptionRequired] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Verificar si el usuario está autenticado
        if (!authService.isAuthenticated()) {
          router.push('/comunidad');
          return;
        }

        // Verificar si la suscripción es obligatoria desde los parámetros
        const isRequired = new URLSearchParams(window.location.search).get('required') === 'true';
        setIsSubscriptionRequired(isRequired);

        // Obtener el perfil del usuario y el estado de suscripción
        const [profile, subscriptionStatus] = await Promise.all([
          authService.getProfile(),
          subscriptionService.getSubscriptionStatus()
        ]);

        // Verificar si el state de suscripción y el perfil no coinciden
        if (profile.has_active_subscription !== subscriptionStatus.has_subscription) {
          console.log('Discrepancia en estado de suscripción, actualizando perfil...');
          // Si hay discrepancia, forzar actualizar el perfil
          const updatedProfile = await authService.getProfile();
          setUserProfile(updatedProfile);
        } else {
          setUserProfile(profile);
        }

        setSubscriptionStatus(subscriptionStatus);

        // Si el usuario viene de registrarse o no tiene suscripción, mostrar modal
        const isNewUser = new URLSearchParams(window.location.search).get('new') === 'true';
        if (isNewUser || !subscriptionStatus.has_subscription) {
          setShowSubscriptionModal(true);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('No se pudo cargar el perfil del usuario.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  if (isLoading) {
    return (
      <MainLayout activeTab="profile">
        <div className="container mx-auto px-4 max-w-5xl pt-6 animate-pulse">
          <div className="h-8 bg-[#323230] w-40 rounded-lg mb-6" />
          <div className="h-96 bg-[#323230] rounded-lg" />
        </div>
      </MainLayout>
    );
  }

  if (error || !userProfile) {
    return (
      <MainLayout activeTab="profile">
        <div className="container mx-auto px-4 max-w-5xl pt-6">
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-6 rounded-lg">
            <p>{error || 'No se encontró el perfil de usuario.'}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Iniciar proceso de suscripción
  const handleStartSubscription = async () => {
    try {
      // URLs para Stripe
      const successUrl = `${window.location.origin}/comunidad`;
      const cancelUrl = `${window.location.origin}/perfil/configuracion`;

      // Crear sesión de checkout
      const session = await subscriptionService.createCheckoutSession(successUrl, cancelUrl);

      // Redirigir a la página de Stripe
      window.location.href = session.checkout_url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('No se pudo iniciar el proceso de suscripción.');
    }
  };

  // Cancelar suscripción
  const handleCancelSubscription = async () => {
    // Primera confirmación más suave
    if (!confirm('Al cancelar tu membresía perderás acceso a contenido exclusivo y funcionalidades premium. ¿Quieres continuar con la gestión de tu suscripción?')) {
      return;
    }

    // Segunda confirmación más directa
    if (!confirm('¿Estás completamente seguro de que deseas cancelar tu membresía? Tus beneficios permanecerán activos hasta el final del período facturado.')) {
      return;
    }

    try {
      await subscriptionService.cancelSubscription();

      // Recargar estado de suscripción
      const subscription = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(subscription);
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('No se pudo cancelar la suscripción.');
    }
  };

  return (
    <MainLayout activeTab="profile">
      {/* Modal de suscripción obligatoria */}
      {isSubscriptionRequired && !subscriptionStatus?.has_subscription && (
        <RequiredSubscriptionModal
          isOpen={true}
          onSuccess={() => router.push('/comunidad')}
        />
      )}

      <div className="container mx-auto px-4 max-w-5xl pt-6 pb-12">
        {!isSubscriptionRequired && (
          <div className="mb-6">
            <Link
              href={userProfile ? `/perfil/${userProfile.username}` : '/comunidad'}
              className="inline-flex items-center text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Volver al perfil
            </Link>
          </div>
        )}
        {isSubscriptionRequired && !subscriptionStatus?.has_subscription && (
          <div className="mb-6 bg-amber-900/30 border border-amber-500/50 text-amber-200 p-4 rounded-md">
            <p className="font-medium">Debes completar tu suscripción para continuar</p>
            <p className="text-sm mt-1">Para acceder a la plataforma necesitas una suscripción activa.</p>
          </div>
        )}

        <ProfileSettings userProfile={userProfile} />

        {/* Información y Detalles de Cuenta - Colapsado por defecto */}
        <div className="bg-[#323230] rounded-lg border border-white/10 p-6 max-w-2xl mx-auto mt-8 opacity-90 hover:opacity-100 transition-opacity">
          <details className="group" open={false}>
            <summary className="cursor-pointer list-none flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Información de cuenta</h2>
              <svg className="h-5 w-5 text-zinc-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>

            <div className="mt-4">
              {subscriptionStatus?.has_subscription ? (
                <div className="bg-[#252524] rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-xl font-medium text-white">Membresía Premium</span>
                    </div>
                    <span className="text-green-400 text-sm font-medium px-3 py-1 bg-green-400/10 rounded-full">
                      Activa
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-zinc-400">Fecha de inicio:</p>
                      <p className="text-zinc-300">
                        {subscriptionStatus.start_date ? new Date(subscriptionStatus.start_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Próxima factura:</p>
                      <p className="text-zinc-300">
                        {subscriptionStatus.end_date ? new Date(subscriptionStatus.end_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <details className="mt-4">
                    <summary className="cursor-pointer list-none text-sm text-zinc-400 hover:text-zinc-300 transition-colors inline-flex items-center">
                      <span>Opciones avanzadas</span>
                      <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="pt-4 pb-2">
                      <button
                        onClick={handleCancelSubscription}
                        className="px-4 py-2 text-zinc-400 hover:text-zinc-300 text-sm rounded-md transition-colors flex items-center"
                      >
                        <span>Cancelar membresía</span>
                      </button>
                    </div>
                  </details>
                </div>
              ) : (
                <div className="bg-[#252524] rounded-lg p-6 mb-4">
                  <div className="text-center mb-4">
                    <span className="text-xl font-bold text-white">No tienes una suscripción activa</span>
                    <p className="text-zinc-400 mt-2">
                      Para acceder a nuestra comunidad y recursos exclusivos, necesitas activar tu suscripción.
                    </p>
                  </div>

                  <div className="bg-[#323230] rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-white">20€</span>
                        <span className="text-zinc-400 ml-1">/ mes</span>
                      </div>
                      <span className="text-green-400 text-sm font-medium">Acceso completo</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={handleStartSubscription}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors w-full"
                    >
                      Activar membresía
                    </button>
                  </div>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </MainLayout>
  );
}