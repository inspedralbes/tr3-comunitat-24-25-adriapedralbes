"use client";

import { Upload, User, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useRef, ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';
import { UserProfile, authService } from '@/services/auth';

interface ProfileSettingsProps {
  userProfile: UserProfile;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ userProfile: initialProfile }) => {
  const router = useRouter();
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
      // console.log('Uploading avatar file:', file.name, file.type, file.size);
      const updatedProfile = await authService.updateAvatar(file);
      // console.log('Profile updated with new avatar:', updatedProfile);
      
      // Actualizar el estado con la nueva URL del avatar
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

  const removeAvatar = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Actualizar perfil con avatar_url = null
      await authService.updateProfile({ avatar_url: null as unknown as string });
      setAvatarPreview(null);
      setSuccess('Foto de perfil eliminada correctamente.');
    } catch (err) {
      console.error('Error removing avatar:', err);
      setError('Error al eliminar la foto de perfil.');
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
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#323230] rounded-lg border border-white/10 p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Configuración de perfil</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-500/50 text-green-200 p-4 rounded-lg mb-6">
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
              
              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
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

          {/* Email y Usuario (solo lectura) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-zinc-300 mb-1 font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={userProfile.email}
                disabled
                className="w-full px-3 py-2 bg-[#1f1f1e] border border-white/10 rounded-md text-zinc-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-zinc-300 mb-1 font-medium">
                Nombre de usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={userProfile.username}
                disabled
                className="w-full px-3 py-2 bg-[#1f1f1e] border border-white/10 rounded-md text-zinc-400 cursor-not-allowed"
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
              type="button"
              variant="outline"
              onClick={() => router.push('/perfil')}
              className="border-white/20 text-zinc-300 hover:text-white hover:bg-[#444442]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};