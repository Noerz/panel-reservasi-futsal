'use client';

import { Text } from '@/components/atoms';
import { UserMenu } from '@/components/molecules';

interface HeaderProps {
  title: string;
  breadcrumb?: string[];
}

export function Header({ title, breadcrumb = ['Admin'] }: HeaderProps) {
  return (
    <header className="flex items-center justify-between py-4 px-6 bg-white border-b border-gray-100">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          {breadcrumb.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              <span>{item}</span>
            </span>
          ))}
        </div>
        <Text variant="h3">{title}</Text>
      </div>
      <UserMenu />
    </header>
  );
}
