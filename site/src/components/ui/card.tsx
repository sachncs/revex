import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'ghost';
}

export function Card({
  className,
  variant = 'default',
  ...props
}: CardProps) {
  const variantClass =
    variant === 'elevated'
      ? 'bg-surface-strong ring-soft'
      : variant === 'ghost'
        ? 'bg-foreground/[0.02] ring-1 ring-inset ring-border-soft'
        : 'bg-surface-strong ring-1 ring-inset ring-border';
  return (
    <div
      className={cn('rounded-2xl', variantClass, className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-b border-border-soft px-4 py-2.5 text-xs text-foreground-muted',
        className,
      )}
      {...props}
    />
  );
}