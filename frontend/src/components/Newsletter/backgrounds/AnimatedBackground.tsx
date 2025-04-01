"use client";

import { FloatingIcons } from './FloatingIcons';
import { AbstractBackground } from './AbstractBackground';

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AbstractBackground />
      <FloatingIcons />
    </div>
  );
}
