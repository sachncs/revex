import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Moon, SunDim, X } from 'lucide-react';
import { Wordmark } from '@/components/brand/wordmark';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { useTheme } from '@/lib/use-theme';
import { NAV_LINKS, HERO } from '@/data/content';
import { cn } from '@/lib/utils';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled
          ? 'border-b border-border-soft glass'
          : 'border-b border-transparent',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-[68px]">
        <a
          href="#main"
          aria-label="Revex home"
          className="inline-flex items-center gap-2"
        >
          <Wordmark size="sm" />
        </a>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-foreground-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Quick search"
            className="hidden h-9 items-center gap-2 rounded-lg border border-border bg-transparent px-3 text-xs text-foreground-muted transition-colors hover:border-foreground/20 hover:text-foreground xl:inline-flex"
          >
            <span>Quick search</span>
            <KbdGroup className="ml-2">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden lg:inline-flex"
          >
            <a
              href="https://github.com/sachncs/revex"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </Button>
          <Button asChild size="sm">
            <a href={HERO.primaryCta.href} target="_blank" rel="noreferrer">
              Get started
            </a>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground-muted hover:text-foreground"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border-soft glass md:hidden"
          >
            <nav
              aria-label="Mobile"
              className="container-page flex flex-col gap-1 py-4"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex items-center gap-2">
                <Button asChild size="sm" className="flex-1">
                  <a href={HERO.primaryCta.href} target="_blank" rel="noreferrer">
                    Get started
                  </a>
                </Button>
                <Button asChild variant="secondary" size="sm" className="flex-1">
                  <a
                    href="https://github.com/sachncs/revex"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container-page -mt-px hidden justify-center md:flex">
        <Badge variant="default" className="rounded-b-full rounded-t-none border-t-0">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald" />
          </span>
          All systems operational · v1.1.0
        </Badge>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { theme, set } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => set(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground-muted transition-colors hover:border-foreground/20 hover:text-foreground"
    >
      <SunDim className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </button>
  );
}