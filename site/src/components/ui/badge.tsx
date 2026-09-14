import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-foreground/5 text-foreground ring-1 ring-inset ring-border',
        solid:
          'bg-foreground text-background',
        outline:
          'bg-transparent text-foreground-soft ring-1 ring-inset ring-border',
        accent:
          'bg-accent-soft text-amber ring-1 ring-inset ring-amber/20',
        primary:
          'bg-primary-soft text-primary ring-1 ring-inset ring-primary/20',
        success:
          'bg-emerald/10 text-emerald ring-1 ring-inset ring-emerald/20',
        danger:
          'bg-rose/10 text-rose ring-1 ring-inset ring-rose/20',
        ghost: 'bg-transparent text-foreground-soft',
      },
      size: {
        sm: 'h-6 px-2 text-[11px]',
        md: 'h-7 px-2.5 text-xs',
        lg: 'h-8 px-3 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
}