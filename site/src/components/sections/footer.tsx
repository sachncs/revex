import { motion } from 'framer-motion';
import { Wordmark } from '@/components/brand/wordmark';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GitBranch, Moon, Star, SunDim } from 'lucide-react';
import { useTheme } from '@/lib/use-theme';
import { FOOTER_COLUMNS } from '@/data/content';
import { cn } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="relative isolate border-t border-border-soft bg-background/40 backdrop-blur-sm">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-[2fr_3fr] md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <a
              href="#main"
              aria-label="Revex home"
              className="inline-flex items-center gap-2.5"
            >
              <Wordmark size="md" />
            </a>
            <p className="max-w-sm text-sm leading-relaxed text-foreground-muted">
              Governed hybrid retrieval for teams that take access seriously.
              Self-host or cloud. MIT-licensed core.
            </p>
            <Badge variant="success" className="w-fit gap-2">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald" />
              </span>
              All systems operational
            </Badge>
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <StarRepoButton />
              <ThemeRow />
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {FOOTER_COLUMNS.map((col, i) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.04 * i }}
              >
                <h3 className="text-eyebrow text-foreground-faint">
                  {col.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-foreground-soft transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-start justify-between gap-4 text-xs text-foreground-muted md:flex-row md:items-center">
          <span>
            © {new Date().getFullYear()} Revex · Governed retrieval for
            serious teams.
          </span>
          <span className="inline-flex items-center gap-3 font-mono">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald" aria-hidden />
              all systems operational
            </span>
            <span aria-hidden className="text-foreground-faint">
              ·
            </span>
            <span>v1.1.0</span>
            <span aria-hidden className="text-foreground-faint">
              ·
            </span>
            <span>MIT</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

function StarRepoButton() {
  return (
    <a
      href="https://github.com/sachncs/revex"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 py-1 transition-colors hover:border-foreground/20 hover:text-foreground"
    >
      <GitBranch className="size-3.5" />
      <Star className="size-3.5" />
      <span>Star on GitHub</span>
    </a>
  );
}

function ThemeRow() {
  const { theme, set } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => set('light')}
        aria-label="Switch to light theme"
        aria-pressed={!isDark}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 py-1 transition-colors hover:border-foreground/20 hover:text-foreground',
          !isDark && 'border-primary/40 text-foreground',
        )}
      >
        <SunDim className="size-3.5" />
        Light
      </button>
      <button
        type="button"
        onClick={() => set('dark')}
        aria-label="Switch to dark theme"
        aria-pressed={isDark}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 py-1 transition-colors hover:border-foreground/20 hover:text-foreground',
          isDark && 'border-primary/40 text-foreground',
        )}
      >
        <Moon className="size-3.5" />
        Dark
      </button>
    </div>
  );
}