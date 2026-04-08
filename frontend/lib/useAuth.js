'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrate = useAuthStore((state) => state.hydrate);
  const isChecking = useAuthStore((state) => state.isChecking);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Sync store initial state on client mount
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isChecking) return;
    if (isLoggedIn) {
      if (!requireAuth) {
        router.replace('/');
      }
    } else {
      if (requireAuth) {
        router.replace('/registration_login');
      }
    }
  }, [requireAuth, router, pathname, isChecking, isLoggedIn, user]);

  return { isChecking, isLoggedIn };
}
