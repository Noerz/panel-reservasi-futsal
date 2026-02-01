'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Text } from '@/components/atoms';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function NavItem({ icon: Icon, label, href, isActive = false, onClick }: NavItemProps) {
  if (!href) {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-accent text-primary'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon size={20} />
        <Text variant="body-sm" color={isActive ? 'primary' : 'white'} className={isActive ? '' : 'opacity-80'}>
          {label}
        </Text>
      </button>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-accent text-primary'
          : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <Text variant="body-sm" color={isActive ? 'primary' : 'white'} className={isActive ? '' : 'opacity-80'}>
        {label}
      </Text>
    </Link>
  );
}
