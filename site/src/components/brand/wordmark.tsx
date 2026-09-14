import { LogoMark } from './logo-mark';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

interface WordmarkProps {
  className?: string;
  size?: Size;
}

const TEXT_SIZE: Record<Size, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
};

const MARK_SIZE: Record<Size, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

export function Wordmark({ className, size = 'md' }: WordmarkProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 font-semibold tracking-tight select-none',
        TEXT_SIZE[size],
        className,
      )}
      aria-label="Revex"
    >
      <LogoMark size={MARK_SIZE[size]} />
      <span className="italic leading-none">
        re
        <span className="not-italic text-primary">›</span>
        ex
      </span>
    </span>
  );
}