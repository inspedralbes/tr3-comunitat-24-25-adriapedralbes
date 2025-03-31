'use client';

import Image from 'next/image';

export function TestImage() {
  return (
    <div className="flex justify-center p-8">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">Testing Image Loading</h2>
        <Image 
          src="/logo_futurprive_sinfondo.png" 
          alt="FuturPrive Logo" 
          width={200}
          height={200}
          priority
          unoptimized={true}
          style={{ objectFit: 'contain' }}
        />
        <p className="mt-4">If this image loads, the path is correct.</p>
      </div>
    </div>
  );
}
