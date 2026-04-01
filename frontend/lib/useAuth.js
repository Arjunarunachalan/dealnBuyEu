'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const hydrate = useAuthStore((state) => state.hydrate);
  const isChecking = useAuthStore((state) => state.isChecking);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    // Sync store initial state on client mount
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isChecking) return;
    
    if (requireAuth && !isLoggedIn) {
      router.push('/registration_login');
    } else if (!requireAuth && isLoggedIn) {
      router.push('/');
    }
  }, [requireAuth, router, isChecking, isLoggedIn]);

  return { isChecking, isLoggedIn };
}
