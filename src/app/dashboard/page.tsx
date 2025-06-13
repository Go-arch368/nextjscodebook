'use client';

import { useUser, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1>Welcome, {user?.firstName || 'User'}!</h1>
        <SignedOut>
          {/* Nothing to show when signed out */}
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}