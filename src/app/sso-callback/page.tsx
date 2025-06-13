'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();

  useEffect(() => {
    handleRedirectCallback({
      redirectUrl: '/dashboard',
      afterSignInUrl: '/dashboard',
      afterSignUpUrl: '/dashboard',
    }).then(() => {
      router.push('/dashboard');
    });
  }, [handleRedirectCallback, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Processing login...</p>
    </div>
  );
}