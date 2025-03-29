"use client";

import React, { useState } from 'react';
import { Video } from 'lucide-react';

interface VideoButtonProps {
  onInsert: (videoHtml: string) => void;
}

export default function VideoButton({ onInsert }: VideoButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  const handleInsert = () => {
    // Validar URL
    if (!videoUrl.trim()) {
      setError('Por favor, ingresa una URL de video.');
      return;
    }

    // Formatear URL para YouTube o Vimeo
    let embedUrl = '';
    let videoId = '';

    // YouTube
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      if (videoUrl.includes('youtube.com/watch?v=')) {
        // Formato normal de YouTube
        videoId = videoUrl.split('v=')[1]?.split('&')[0];
      } else if (videoUrl.includes('youtu.be/')) {
        // Formato corto de YouTube
        videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      } else if (videoUrl.includes('youtube.com/embed/')) {
        // Ya es una URL de embed
        videoId = videoUrl.split('youtube.com/embed/')[1]?.split('?')[0];
      }

      if (!videoId) {
        setError('URL de YouTube no válida.');
        return;
      }

      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } 
    // Vimeo
    else if (videoUrl.includes('vimeo.com')) {
      if (videoUrl.includes('player.vimeo.com/video/')) {
        // Ya es una URL de embed
        videoId = videoUrl.split('player.vimeo.com/video/')[1]?.split('?')[0];
      } else {
        // Formato normal de Vimeo
        videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
      }

      if (!videoId) {
        setError('URL de Vimeo no válida.');
        return;
      }

      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    } else {
      setError('Por favor, usa una URL de YouTube o Vimeo.');
      return;
    }

    // Código HTML para insertar
    const videoHtml = `<div class="video-container" style="max-width: 800px; margin: 0 auto;">
<iframe src="${embedUrl}" width="100%" height="450" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="Video"></iframe>
</div>`;

    onInsert(videoHtml);
    setShowModal(false);
    setVideoUrl('');
    setError('');
  };

  return (
    <>
      <button
        type="button"
        className="toolbar-button p-1.5 rounded hover:bg-zinc-700 text-white/80 hover:text-white"
        onClick={() => setShowModal(true)}
        title="Insertar video de YouTube o Vimeo"
      >
        <Video size={18} />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-zinc-800 p-4 rounded-lg w-full max-w-md">
            <h3 className="text-white text-lg font-medium mb-3">Insertar Video</h3>
            <div className="mb-4">
              <label htmlFor="video-url" className="block text-white/70 mb-1 text-sm">
                URL del video (YouTube o Vimeo)
              </label>
              <input
                id="video-url"
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
              />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1.5 bg-zinc-700 text-white rounded hover:bg-zinc-600"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-500"
                onClick={handleInsert}
              >
                Insertar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
