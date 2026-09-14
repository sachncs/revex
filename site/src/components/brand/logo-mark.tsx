import { cn } from '@/lib/utils';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<Size, number> = {
  xs: 18,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 72,
};

interface LogoMarkProps {
  className?: string;
  size?: Size;
  ariaLabel?: string;
}

export function LogoMark({ className, size = 'md', ariaLabel = 'Revex' }: LogoMarkProps) {
  const px = SIZE_PX[size];

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={cn('inline-flex shrink-0 items-center justify-center', className)}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="rvx-mark"
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#5a6cff" />
            <stop offset="55%" stopColor="#7c6cff" />
            <stop offset="100%" stopColor="#f0b86e" />
          </linearGradient>
          <linearGradient
            id="rvx-glyph"
            x1="14"
            y1="14"
            x2="50"
            y2="50"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#fbfaf7" />
            <stop offset="100%" stopColor="#f0eee8" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#rvx-mark)" />
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="16"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <path
          d="M18 14 L18 50 L24 50 L24 24 L46 50 L46 14 L40 14 L40 40 L18 14 Z"
          fill="url(#rvx-glyph)"
          fillOpacity="0.96"
        />
      </svg>
    </span>
  );
}