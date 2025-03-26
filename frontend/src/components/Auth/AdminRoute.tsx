"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { default as authService } from '@/services/auth';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Verificar si el usuario está autenticado
        if (!authService.isAuthenticated()) {
          router.push('/auth/login?returnUrl=/classroom');
          return;
        }

        // Obtener el perfil del usuario
        const userProfile = await authService.getProfile();
        
        // Verificar si el usuario es administrador
        // La propiedad "is_staff" o "is_superuser" debe venir del backend
        if (!userProfile.is_staff && !userProfile.is_superuser) {
          router.push('/classroom');
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        console.error('Error verificando permisos de administrador:', error);
        router.push('/classroom');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1F1F1E]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Solo mostrar el contenido si el usuario es administrador
  return isAdmin ? <>{children}</> : null;
}
