"use client";

import { HardDrive, Info, MessageCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { ProfileHeader } from '@/components/Profile/ProfileHeader';
import { UserActivityTab } from '@/components/Profile/UserActivityTab';
import { UserPostsTab } from '@/components/Profile/UserPostsTab';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { UserProfile, authService } from '@/services/auth';
import { getUserByUsername } from '@/services/users';

type TabType = 'posts' | 'activity' | 'info';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Check if the user is looking at their own profile
        let profile: UserProfile | null = null;
        let isOwnProfile = false;
        
        if (authService.isAuthenticated()) {
          const currentUserProfile = await authService.getProfile();
          
          if (currentUserProfile.username === username) {
            profile = currentUserProfile;
            isOwnProfile = true;
          }
        }
        
        // If it's not the current user's profile, fetch the profile by username
        if (!profile) {
          try {
            profile = await getUserByUsername(username);
          } catch (err) {
            console.error('Error fetching user profile by username:', err);
            setError('No se pudo encontrar el perfil del usuario.');
            setIsLoading(false);
            return;
          }
        }
        
        setUserProfile(profile);
        setIsCurrentUser(isOwnProfile);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('No se pudo cargar el perfil del usuario.');
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username, router]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    if (!userProfile) return null;

    switch (activeTab) {
      case 'posts':
        return <UserPostsTab userId={userProfile.id} />;
      case 'activity':
        return <UserActivityTab userId={userProfile.id} />;
      case 'info':
        return (
          <div className="bg-[#323230] rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Información personal</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <p className="text-zinc-400 text-sm">Nombre</p>
                  <p className="text-white">
                    {userProfile.first_name && userProfile.last_name
                      ? `${userProfile.first_name} ${userProfile.last_name}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Email</p>
                  <p className="text-white">{isCurrentUser ? userProfile.email : '-'}</p>
                </div>
                <div className="mt-2">
                  <p className="text-zinc-400 text-sm">Sitio web</p>
                  <p className="text-white">
                    {userProfile.website ? (
                      <a
                        href={userProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {userProfile.website}
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-zinc-400 text-sm">Miembro desde</p>
                  <p className="text-white">
                    {new Date(userProfile.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {userProfile.bio && (
                <div className="mt-4">
                  <p className="text-zinc-400 text-sm">Biografía</p>
                  <p className="text-white mt-1">{userProfile.bio}</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <MainLayout activeTab="members">
        <div className="container mx-auto px-4 max-w-5xl pt-6 animate-pulse">
          <div className="h-48 bg-[#323230] rounded-lg mb-6" />
          <div className="h-12 bg-[#323230] rounded-lg mb-6" />
          <div className="h-96 bg-[#323230] rounded-lg" />
        </div>
      </MainLayout>
    );
  }

  if (error || !userProfile) {
    return (
      <MainLayout activeTab="members">
        <div className="container mx-auto px-4 max-w-5xl pt-6">
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-6 rounded-lg text-center">
            <p className="mb-4">{error || 'No se encontró el perfil de usuario.'}</p>
            <Button
              onClick={() => router.push('/comunidad')}
              className="bg-red-600 hover:bg-red-700"
            >
              Volver a la comunidad
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeTab="members">
      <div className="container mx-auto px-4 max-w-5xl pt-6 pb-12">
        {/* Header del perfil */}
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-white">
            {isCurrentUser ? 'Mi perfil' : `Perfil de ${userProfile.username}`}
          </h1>
          {isCurrentUser && (
            <Button
              onClick={() => router.push('/perfil/configuracion')}
              className="bg-[#444442] hover:bg-[#505050] text-white"
            >
              Editar perfil
            </Button>
          )}
        </div>

        {/* Información del perfil */}
        <ProfileHeader userProfile={userProfile} />

        {/* Pestañas */}
        <div className="mb-6 border-b border-white/10">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              className={`px-4 py-2 rounded-t-lg ${
                activeTab === 'posts'
                  ? 'bg-[#323230] text-white border-t border-r border-l border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              onClick={() => handleTabChange('posts')}
            >
              <div className="flex items-center gap-2">
                <HardDrive size={16} />
                <span>Publicaciones</span>
              </div>
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg ${
                activeTab === 'activity'
                  ? 'bg-[#323230] text-white border-t border-r border-l border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              onClick={() => handleTabChange('activity')}
            >
              <div className="flex items-center gap-2">
                <MessageCircle size={16} />
                <span>Actividad</span>
              </div>
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg ${
                activeTab === 'info'
                  ? 'bg-[#323230] text-white border-t border-r border-l border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              onClick={() => handleTabChange('info')}
            >
              <div className="flex items-center gap-2">
                <Info size={16} />
                <span>Información</span>
              </div>
            </button>
          </div>
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="min-h-[300px]">
          {renderTabContent()}
        </div>
      </div>
    </MainLayout>
  );
}