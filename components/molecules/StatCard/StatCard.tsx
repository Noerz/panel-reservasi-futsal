'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, Text } from '@/components/atoms';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'primary';
}

export function StatCard({ icon: Icon, title, value, subtitle, variant = 'default' }: StatCardProps) {
  const isPrimary = variant === 'primary';

  return (
    <Card variant={isPrimary ? 'primary' : 'outlined'} className="min-w-[200px]">
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${isPrimary ? 'bg-white/20' : 'bg-primary/10'}`}>
          <Icon size={24} className={isPrimary ? 'text-white' : 'text-primary'} />
        </div>
        <div className="flex-1">
          <Text variant="body-sm" color={isPrimary ? 'white' : 'muted'} className="mb-1">
            {title}
          </Text>
          <Text variant="h3" color={isPrimary ? 'white' : 'default'}>
            {value}
          </Text>
          {subtitle && (
            <Text variant="caption" color={isPrimary ? 'white' : 'muted'} className="mt-1 opacity-80">
              {subtitle}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
}
