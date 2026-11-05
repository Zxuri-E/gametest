import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'subtle' | 'interactive';
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  header,
  footer,
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-canvas-900 border border-border-default shadow-panel',
    glass: 'glass-panel shadow-panel',
    subtle: 'bg-canvas-850/60 border border-border-subtle',
    interactive:
      'bg-canvas-900 border border-border-default hover:border-border-hover hover:bg-canvas-850 cursor-pointer transition-all duration-150',
  };

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden',
        variants[variant],
        className
      )}
      {...props}
    >
      {header && (
        <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between bg-canvas-850/30">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-border-subtle bg-canvas-950/40 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

