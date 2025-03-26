"use client";

import { Upload, User, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useRef, ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';
import { UserProfile, authService } from '@/services/auth';
import { default as subscriptionService } from '@/services/subscription';

interface ProfileSetupModalProps {
  userProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ 
  userProfile: initialProfile, 
  isOpen, 
  onClose,
  onComplete 
}) => {
  const _router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile.avatar_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar que es una imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida.');
      return;
    }

    // Crear URL para previsualización
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Actualizar avatar
    handleAvatarUpload(file);
  };

  const handleAvatarUpload = async (file: File) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedProfile = await authService.updateAvatar(file);
      setUserProfile(updatedProfile);
      setAvatarPreview(updatedProfile.avatar_url);
      setSuccess('Foto de perfil actualizada correctamente.');
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError('Error al actualizar la foto de perfil. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Actualizar solo los campos que se pueden modificar
      const updatedData = {
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        bio: userProfile.bio,
        website: userProfile.website
      };

      const result = await authService.updateProfile(updatedData);
      setUserProfile(result);
      setSuccess('Perfil actualizado correctamente.');
      
      // Proceder al checkout
      proceedToSubscription();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil. Inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  const proceedToSubscription = async () => {
    try {
      // Crear URLs de éxito y cancelación
      const successUrl = `${window.location.origin}/dashboard`;
      const cancelUrl = `${window.location.origin}/profile`;
      
      // Redirigir a la página de pago de Stripe con los parámetros requeridos
      const result = await subscriptionService.createCheckoutSession(successUrl, cancelUrl);
      
      if (result && result.checkout_url) {
        // Redirigir al usuario a la URL de checkout de Stripe
        window.location.href = result.checkout_url;
      } else {
        throw new Error('No se pudo obtener la URL de pago');
      }
    } catch (err) {
      console.error('Error al crear sesión de pago:', err);
      setError('Error al procesar el pago. Inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div 
        className="relative bg-[#323230] p-6 rounded-lg w-full max-w-xl mx-4 md:mx-auto shadow-xl border border-white/10 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="profile-setup-dialog-title"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <h2 id="profile-setup-dialog-title" className="text-2xl font-bold text-white mb-2">Configura tu perfil</h2>
        <p className="text-zinc-400 mb-6">Completa tu información para personalizar tu experiencia</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 text-green-200 rounded-md text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar */}
          <div className="mb-6">
            <span className="block text-zinc-300 mb-2 font-medium">Foto de perfil</span>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className="w-20 h-20 bg-[#444442] rounded-full overflow-hidden border border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={handleAvatarClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleAvatarClick();
                      e.preventDefault();
                    }
                  }}
                  aria-label="Cambiar avatar"
                >
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Previsualización de avatar"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      unoptimized={avatarPreview.includes('127.0.0.1') || avatarPreview.includes('localhost')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <User size={32} />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <Upload size={20} className="text-white" />
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-zinc-400">
                <p>Haz clic para subir una nueva foto</p>
                <p>Formatos aceptados: JPG, PNG (máx. 2MB)</p>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-zinc-300 mb-1 font-medium">
                  Nombre
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={userProfile.first_name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#252524] border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-zinc-300 mb-1 font-medium">
                  Apellido
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={userProfile.last_name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#252524] border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Biografía */}
            <div>
              <label htmlFor="bio" className="block text-zinc-300 mb-1 font-medium">
                Biografía
              </label>
              <textarea
                id="bio"
                name="bio"
                value={userProfile.bio || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-[#252524] border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                placeholder="Cuéntanos sobre ti..."
              />
            </div>

            {/* Sitio web */}
            <div>
              <label htmlFor="website" className="block text-zinc-300 mb-1 font-medium">
                Sitio web
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={userProfile.website || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#252524] border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="https://tusitio.com"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Guardando...' : 'Continuar a suscripción'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};