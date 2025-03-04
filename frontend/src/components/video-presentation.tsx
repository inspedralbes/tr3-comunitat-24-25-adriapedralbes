"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { ShineBorder } from "./magicui/shine-border";

export function VideoPresentation() {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="relative mt-16">
      {/* Gradient background blur */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-[100px]" />
      </div>

      <div className="flex justify-center">
        <ShineBorder
          borderRadius={32}
          borderWidth={3}
          duration={14}
          color={[
            "rgba(255,255,255,0.15)",
            "#ffffffaa",
            "rgba(255,255,255,0.3)",
          ]}
          className={cn(
            "min-h-0 min-w-0 bg-neutral-800/50 p-3 rounded-[32px] border-white/5",
            "w-full max-w-4xl"
          )}
        >
          {/* Borde gris exterior */}
          {/* Borde negro interior */}
          <div className="rounded-[24px] bg-black p-2 w-full">
            {!videoError ? (
              <video
                className="w-full h-auto rounded-2xl"
                autoPlay
                loop
                muted
                playsInline
                onError={() => setVideoError(true)}
                style={{ display: "block", minHeight: "300px" }}
              >
                <source src="/videos/loop-demo.mp4" type="video/mp4" />
                Tu navegador no soporta la reproducción de video.
              </video>
            ) : (
              // Fallback para cuando hay error de video
              <div
                className="w-full rounded-2xl bg-neutral-900 flex items-center justify-center"
                style={{ minHeight: "300px" }}
              >
                <p className="text-gray-400">Video no disponible en este navegador</p>
              </div>
            )}
          </div>
        </ShineBorder>
      </div>
    </div>
  );
}