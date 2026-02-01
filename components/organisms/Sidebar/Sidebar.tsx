'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, ClipboardList, LogOut, Volleyball } from 'lucide-react';
import { NavItem } from '@/components/molecules';
import { Text } from '@/components/atoms';
import { useUIStore, useAuthStore } from '@/stores';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Calendar, label: 'Kelola Lapangan', href: '/admin/fields' },
  { icon: ClipboardList, label: 'Kelola Pesanan', href: '/admin/orders' },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeNav, setActiveNav } = useUIStore();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-primary to-primary-dark min-h-screen p-6 flex flex-col shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-md">
          <Volleyball size={28} className="text-white" />
        </div>
        <div>
          <Text variant="body" color="white" className="font-bold text-lg">
            Mini Soccer Vanue
          </Text>
          <Text variant="caption" color="white" className="opacity-80">
            Admin Panel
          </Text>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={activeNav === item.href || pathname === item.href}
            onClick={() => setActiveNav(item.href)}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="pt-4 border-t border-white/20">
        <NavItem
          icon={LogOut}
          label="Logout"
          onClick={handleLogout}
        />
      </div>
    </aside>
  );
}