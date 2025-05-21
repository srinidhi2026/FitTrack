
import React from "react";
import { cn } from "@/lib/utils";
import { gradients, hoverEffects } from "@/styles/gradients";
import { useTheme } from 'next-themes';

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  gradientType?: keyof typeof gradients;
  children: React.ReactNode;
  hoverEffect?: keyof typeof hoverEffects | boolean;
}

export function GradientCard({
  className,
  gradientType = "card",
  children,
  hoverEffect,
  ...props
}: GradientCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  
  // Get gradient class based on theme
  const gradientClass = isDark
    ? gradients[gradientType].dark
    : gradients[gradientType].light;
    
  // Get hover effect if requested
  let hoverEffectClass = "";
  
  if (typeof hoverEffect === 'string') {
    // Make sure we're handling hover effects that might be objects with light/dark variants
    const effectValue = hoverEffects[hoverEffect];
    hoverEffectClass = typeof effectValue === 'string' 
      ? effectValue 
      : (isDark ? effectValue.dark : effectValue.light);
  } else if (hoverEffect === true) {
    hoverEffectClass = hoverEffects.lift;
  }
  
  return (
    <div
      className={cn(
        "rounded-lg border shadow-sm",
        gradientClass,
        hoverEffectClass,
        isDark ? "border-gray-800" : "border-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
