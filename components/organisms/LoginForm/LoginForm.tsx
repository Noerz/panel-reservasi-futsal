'use client';

import { FormEvent, ReactNode } from 'react';
import { Card } from '@/components/atoms';

interface LoginFormProps {
  header: ReactNode;
  demoInfo?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onSubmit: (e: FormEvent) => void;
}

export function LoginForm({ header, demoInfo, error, children, footer, onSubmit }: LoginFormProps) {
  return (
    <Card className="rounded-3xl border border-gray-200 shadow-xl" padding="lg">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Header */}
        {header}

        {/* Demo Info */}
        {demoInfo}

        {/* Error */}
        {error}

        {/* Form Fields */}
        {children}

        {/* Footer */}
        {footer}
      </form>
    </Card>
  );
}
