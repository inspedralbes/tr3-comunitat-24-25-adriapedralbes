"use client";

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import MainLayout from '@/components/layouts/MainLayout';
import { authService } from '@/services/auth';

/**
 * This page now acts as a redirector to the username-based profile page
 */
export default function ProfileRedirectPage() {
  const router = useRouter();
  const [_isLoading, _setIsLoading] = useState(true);

  useEffect(() => {
    const redirectToUserProfile = async () => {
      try {
        // Check if the user is logged in
        if (!authService.isAuthenticated()) {
          router.push('/comunidad');
          return;
        }

        // Get the current user's profile
        const profile = await authService.getProfile();
        
        // Redirect to the username-based profile page
        router.push(`/perfil/${profile.username}`);
      } catch (err) {
        console.error('Error redirecting to user profile:', err);
        router.push('/comunidad');
      }
    };

    redirectToUserProfile();
  }, [router]);

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