"use client";

import { AbstractBackground } from './AbstractBackground';
import { FloatingIcons } from './FloatingIcons';

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AbstractBackground />
      <FloatingIcons />
    </div>
  );
}
