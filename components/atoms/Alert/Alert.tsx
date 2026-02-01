'use client';

import { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  variant?: 'error' | 'info' | 'success' | 'warning';
  icon?: ReactNode;
}

export function Alert({ children, variant = 'info', icon }: AlertProps) {
  const variants = {
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  return (
    <div className={`rounded-2xl border p-4 ${variants[variant]}`}>
      <div className="flex items-start gap-3">
        {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
