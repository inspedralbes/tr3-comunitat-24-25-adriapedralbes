"use client";

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import MainLayout from '@/components/layouts/MainLayout';
import { ProfileSettings } from '@/components/Profile/ProfileSettings';
import { UserProfile, authService } from '@/services/auth';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

        // Obtener el perfil del usuario
        const profile = await authService.getProfile();
        setUserProfile(profile);
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
      <MainLayout activeTab="members">
        <div className="container mx-auto px-4 max-w-5xl pt-6 animate-pulse">
          <div className="h-8 bg-[#323230] w-40 rounded-lg mb-6" />
          <div className="h-96 bg-[#323230] rounded-lg" />
        </div>
      </MainLayout>
    );
  }

  if (error || !userProfile) {
    return (
      <MainLayout activeTab="members">
        <div className="container mx-auto px-4 max-w-5xl pt-6">
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-6 rounded-lg">
            <p>{error || 'No se encontró el perfil de usuario.'}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeTab="members">
      <div className="container mx-auto px-4 max-w-5xl pt-6 pb-12">
        <div className="mb-6">
          <Link
            href={userProfile ? `/perfil/${userProfile.username}` : '/comunidad'}
            className="inline-flex items-center text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver al perfil
          </Link>
        </div>

        <ProfileSettings userProfile={userProfile} />
      </div>
    </MainLayout>
  );
}