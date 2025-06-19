'use client';

import { useEffect } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      if (!signIn) return;
      try {
        console.log('Handling OAuth callback');
        const response = await signIn.create({
          strategy: 'oauth_google',
          redirectUrl: typeof window !== 'undefined' ? window.location.origin + '/auth-callback' : '/auth-callback',
        });
        console.log('Callback response:', response);
        if (response.createdSessionId) {
          await setActive({ session: response.createdSessionId });
          console.log('Session set, redirecting to dashboard');
          router.push('/dashboard'); // Adjust to your desired route
        } else {
          console.log('No session created in callback, status:', response.status);
          router.push('/'); // Redirect to homepage on failure
        }
      } catch (err: any) {
        console.error('Callback error:', err);
        router.push('/'); // Redirect to homepage on error
      }
    }
    handleCallback();
  }, [signIn, router]);

  return <div>Loading...</div>;
}