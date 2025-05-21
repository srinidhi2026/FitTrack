
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { gradients } from '@/styles/gradients';

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientType?: keyof typeof gradients;
  hoverEffect?: 'lift' | 'glow' | 'none';
  children: React.ReactNode;
}

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
