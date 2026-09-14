import { motion } from 'framer-motion';
import { ArrowRight, GitBranch, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveQuery } from './live-query';
import { HERO } from '@/data/content';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-16 pt-14 md:pb-24 md:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60vh] bg-gradient-to-b from-primary/[0.06] via-background to-transparent dark:from-primary/[0.08]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-40 -z-10 h-px w-[600px] max-w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      <div className="container-page flex flex-col items-center text-center">
        <motion.a
          href="#capabilities"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="group mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground-muted shadow-sm ring-1 ring-inset ring-border-soft backdrop-blur-md transition-colors hover:border-foreground/20 hover:text-foreground"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-semibold text-foreground">
            <Sparkles className="size-3" />
            v1.1
          </span>
          <span>{HERO.eyebrow.replace('Revex v1.1 · ', '')}</span>
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </motion.a>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl text-balance text-display-1 text-foreground"
        >
          Hybrid retrieval,
          <br className="hidden sm:block" />{' '}
          <span className="text-gradient-brand">governed end-to-end.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-2xl text-pretty text-lg text-foreground-muted md:text-xl"
        >
          {HERO.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="px-6">
            <a href={HERO.primaryCta.href} target="_blank" rel="noreferrer">
              {HERO.primaryCta.label}
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button asChild variant="secondary" size="lg" className="px-6">
            <a href={HERO.secondaryCta.href} target="_blank" rel="noreferrer">
              <GitBranch className="size-4" />
              {HERO.secondaryCta.label}
            </a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-foreground-muted"
        >
          {HERO.badges.map((b, i) => (
            <span key={b} className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald" />
                {b}
              </span>
              {i < HERO.badges.length - 1 && (
                <span aria-hidden className="text-foreground-faint">
                  ·
                </span>
              )}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 w-full max-w-4xl"
        >
          <LiveQuery />
        </motion.div>
      </div>
    </section>
  );
}