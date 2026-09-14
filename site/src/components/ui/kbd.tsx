import * as React from 'react';
import { cn } from '@/lib/utils';

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-background/60 px-1.5 text-[10px] font-medium text-foreground-muted shadow-[0_1px_0_oklch(0_0_0/0.04)]',
        className,
      )}
      {...props}
    />
  );
}

export function KbdGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  );
}