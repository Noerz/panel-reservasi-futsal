'use client';

import { ReactNode } from 'react';
import { Volleyball } from 'lucide-react';
import { Text } from '@/components/atoms';

interface LoginBrandingProps {
  title?: string;
  subtitle?: string;
  features?: ReactNode;
  testimonial?: ReactNode;
}

export function LoginBranding({
  title = 'Sistem Manajemen Mini Soccer Venue',
  subtitle = 'Platform terpadu untuk mengelola reservasi lapangan futsal dan mini soccer secara efisien',
  features,
  testimonial,
}: LoginBrandingProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-dark">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), 
                            radial-gradient(circle at 75px 75px, white 2%, transparent 0%)`,
            backgroundSize: '100px 100px',
          }}
        ></div>
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center w-full p-8 xl:p-12">
        <div className="max-w-2xl w-full">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 mb-10">
            <Volleyball size={48} className="text-white" />
          </div>

          {/* Title */}
          <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          <Text variant="body" color="white" className="text-xl mb-12 opacity-90 max-w-2xl">
            {subtitle}
          </Text>

          {/* Features */}
          {features && <div className="mb-16">{features}</div>}

          {/* Testimonial */}
          {testimonial}
        </div>
      </div>
    </div>
  );
}
