import { HTMLAttributes, ReactNode, ElementType } from 'react';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-sm' | 'caption';

interface TextProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: TextVariant;
  as?: ElementType;
  color?: 'default' | 'muted' | 'primary' | 'success' | 'error' | 'white';
}

export function Text({
  children,
  variant = 'body',
  as,
  color = 'default',
  className = '',
  ...props
}: TextProps) {
  const variants: Record<TextVariant, string> = {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-semibold',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-medium',
    body: 'text-base',
    'body-sm': 'text-sm',
    caption: 'text-xs',
  };

  const colors = {
    default: 'text-gray-900',
    muted: 'text-gray-500',
    primary: 'text-primary',
    success: 'text-green-600',
    error: 'text-red-600',
    white: 'text-white',
  };

  const defaultTags: Record<TextVariant, ElementType> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    body: 'p',
    'body-sm': 'p',
    caption: 'span',
  };

  const Component = as || defaultTags[variant];

  return (
    <Component
      className={`${variants[variant]} ${colors[color]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
