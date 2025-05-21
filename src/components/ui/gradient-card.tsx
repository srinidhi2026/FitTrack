
import React from 'react';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface GradientCardProps extends CardProps {
  gradientType?: keyof typeof gradients;
  hoverEffect?: 'lift' | 'glow' | 'none';
  children: React.ReactNode;
}

// Gradient styles for light and dark themes
const gradients = {
  primary: {
    light: 'bg-gradient-to-r from-blue-100 via-blue-50 to-white',
    dark: 'bg-gradient-to-r from-blue-900/50 via-blue-900/25 to-transparent'
  },
  secondary: {
    light: 'bg-gradient-to-r from-purple-100 via-purple-50 to-white',
    dark: 'bg-gradient-to-r from-purple-900/50 via-purple-900/25 to-transparent'
  },
  success: {
    light: 'bg-gradient-to-r from-green-100 via-green-50 to-white',
    dark: 'bg-gradient-to-r from-green-900/50 via-green-900/25 to-transparent'
  },
  card: {
    light: 'bg-white dark:bg-transparent border border-gray-200',
    dark: 'bg-gray-900/50 backdrop-blur-sm border border-gray-800'
  }
};

// Hover effect styles
const hoverEffects = {
  lift: 'transition-transform duration-300 ease-in-out hover:translate-y-[-5px]',
  glow: 'transition-shadow duration-300 ease-in-out hover:shadow-lg hover:shadow-primary-300/25',
  none: ''
};

export function GradientCard({
  gradientType = 'card',
  hoverEffect = 'none',
  className,
  children,
  ...props
}: GradientCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const gradientClass = isDark 
    ? gradients[gradientType].dark 
    : gradients[gradientType].light;
    
  const hoverClass = hoverEffects[hoverEffect];

  return (
    <Card 
      className={cn(gradientClass, hoverClass, className)} 
      {...props}
    >
      {children}
    </Card>
  );
}
