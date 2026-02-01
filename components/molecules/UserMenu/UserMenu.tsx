'use client';

import { ChevronDown, User } from 'lucide-react';
import { Text, Avatar } from '@/components/atoms';
import { useAuthStore } from '@/stores';
import { useState, useRef, useEffect } from 'react';

interface UserMenuProps {
  name?: string;
  avatar?: string;
}

export function UserMenu({ name: nameProp, avatar }: UserMenuProps) {
  const { user, logout } = useAuthStore();
  const name = nameProp || user?.name || 'Admin';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
      >
        <Avatar src={avatar} size="sm" />
        <Text variant="body-sm" className="font-medium">
          {name}
        </Text>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
          <div className="px-4 py-2 border-b border-gray-100">
            <Text variant="body-sm" className="font-medium">{name}</Text>
            <Text variant="caption" color="muted">{user?.email}</Text>
          </div>
          <button
            onClick={() => {
              logout().then(() => {
                // redirect to login after logout
                window.location.href = '/login';
              }).catch(() => {
                window.location.href = '/login';
              });
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}