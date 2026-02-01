'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, initialized, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (initialized) {
      if (isAuthenticated) {
        router.replace('/admin');
      } else {
        router.replace('/login');
      }
    }
  }, [initialized, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
