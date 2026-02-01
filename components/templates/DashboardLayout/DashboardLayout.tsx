'use client';

import { ReactNode } from 'react';
import { Sidebar, Header } from '@/components/organisms';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumb?: string[];
}

export function DashboardLayout({ children, title, breadcrumb }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title={title} breadcrumb={breadcrumb} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
