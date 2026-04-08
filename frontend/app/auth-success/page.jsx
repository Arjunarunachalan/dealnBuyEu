'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';

function FinalizeAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const userParam = searchParams.get('user');
    
    if (accessToken && userParam) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(userParam));
        
        // Hydrate store and localStorage
        useAuthStore.getState().login(decodedUser, accessToken);
        setTimeout(() => {
           router.replace('/');
        }, 500);
      } catch (err) {
        console.error("Failed to parse user data from URL:", err);
        router.replace('/registration_login?error=Invalid_Data');
      }
    } else {
      router.replace('/registration_login?error=Missing_Tokens');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4F7]">
      <div className="flex flex-col items-center">
         <div className="w-10 h-10 border-4 border-[#046BD2] border-t-transparent rounded-full animate-spin"></div>
         <p className="mt-4 text-[#333333] font-medium">Finalizing Authentication...</p>
      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center bg-[#F2F4F7]">
         <p className="mt-4 text-[#333333] font-medium">Loading...</p>
       </div>
    }>
      <FinalizeAuth />
    </Suspense>
  );
}
