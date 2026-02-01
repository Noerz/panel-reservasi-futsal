'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/templates';
import { StatsGrid, VerificationList } from '@/components/organisms';
import { useAuthStore } from '@/stores';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, initialized, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [initialized, isAuthenticated, router]);

  return (
    <DashboardLayout title="Dashboard" breadcrumb={['Admin', 'Dashboard']}>
      <div className="space-y-8">
        <StatsGrid />
        <VerificationList />
      </div>
    </DashboardLayout>
  );
}
