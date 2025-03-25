"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { authService } from '@/services/auth';
import subscriptionService, { SubscriptionStatus } from '@/services/subscription';

interface SubscriptionCheckProps {
  children: React.ReactNode;
}

export const SubscriptionCheck: React.FC<SubscriptionCheckProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  
  // Páginas protegidas que requieren suscripción
  const protectedPaths = [
    '/comunidad',
    '/classroom',
    '/calendar',
    '/members',
    '/leaderboards',
    '/about',
  ];
  
  // Comprobar si la ruta actual está protegida
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // Si la ruta no está protegida, no verificamos suscripción
        if (!isProtectedPath) {
          setIsLoading(false);
          return;
        }
        
        // Si el usuario no está autenticado, redirigimos al login
        if (!authService.isAuthenticated()) {
          console.log('Usuario no autenticado, mostrando modal de login');
          setIsLoading(false);
          return;
        }
        
        // Verificar estado de suscripción
        const status: SubscriptionStatus = await subscriptionService.getSubscriptionStatus()
          .catch(error => {
            console.error('Error al verificar suscripción:', error);
            // En caso de error, permitimos el acceso temporalmente
            return { has_subscription: true, subscription_status: null, start_date: null, end_date: null };
          });

        console.log('Estado de suscripción:', status);
        setHasSubscription(status.has_subscription);
        
        // Forzar al usuario a completar el proceso de suscripción
        if (!status.has_subscription && isProtectedPath) {
          console.log('Usuario sin suscripción, redirigiendo a configuración');
          router.push('/perfil/configuracion?required=true');
          return; // Salimos para evitar que se procese cualquier otra cosa
        }
      } catch (error) {
        console.error('Error general al verificar suscripción:', error);
        // En caso de error general, permitimos el acceso temporalmente
        setHasSubscription(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSubscription();
  }, [pathname, router, isProtectedPath]);
  
  // Mostrar spinner durante la carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }
  
  // Si está en una ruta protegida y no tiene suscripción, no mostrar nada
  // (la redirección ya está en marcha)
  if (isProtectedPath && !hasSubscription && authService.isAuthenticated()) {
    return null;
  }
  
  // Si todo está bien, mostrar los hijos
  return <>{children}</>;
};

export default SubscriptionCheck;
