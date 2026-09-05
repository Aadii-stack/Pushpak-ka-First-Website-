'use client';

import React from 'react';

export type GlassVariant = 'subtle' | 'standard' | 'prominent';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  hoverLift?: boolean;
  as?: React.ElementType;
  href?: any;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * Reusable GlassPanel primitive for FoodBridge
 * Variants:
 *  - subtle: lighter blur and border, ideal for nested cards or secondary surfaces
 *  - standard: default frosted glass surface with 20px blur and light-catching 1px border
 *  - prominent: elevated hero cards, active panels, modals with deep soft shadow
 */
export default function GlassPanel({
  variant = 'standard',
  hoverLift = false,
  as: Component = 'div',
  children,
  className = '',
  ...props
}: GlassPanelProps) {
  const variantStyles = {
    subtle: 'bg-white/45 backdrop-blur-[14px] backdrop-saturate-[130%] border border-white/55 shadow-[0_4px_20px_rgba(34,40,43,0.05)]',
    standard: 'bg-white/70 backdrop-blur-[20px] backdrop-saturate-[140%] border border-white/75 shadow-[0_8px_32px_rgba(34,40,43,0.09)]',
    prominent: 'bg-white/85 backdrop-blur-[24px] backdrop-saturate-[150%] border border-white/90 shadow-[0_14px_44px_rgba(34,40,43,0.12)]',
  };

  const liftStyles = hoverLift
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(34,40,43,0.13)] hover:bg-white/75 cursor-pointer'
    : '';

  return (
    <Component
      className={`rounded-3xl ${variantStyles[variant]} ${liftStyles} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
