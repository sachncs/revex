import { motion } from 'framer-motion';
import { ArrowRight, GitBranch, MessagesSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { LogoMark } from '@/components/brand/logo-mark';

export function FinalCta() {
  return (
    <section
      id="cta"
      className="relative isolate overflow-hidden py-20 md:py-32"
    >
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card variant="elevated" className="relative overflow-hidden">
            <CardBody className="flex flex-col items-center px-8 py-16 text-center md:px-16 md:py-24">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 gradient-mesh opacity-70 dark:gradient-mesh-dark"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-32 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-amber/15 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-32 -left-32 -z-10 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl"
              />

              <LogoMark size="xl" />

              <h2 className="mt-6 max-w-3xl text-balance text-display-2 text-foreground">
                Retrieval you can run,
                <br className="hidden md:block" />{' '}
                <span className="text-gradient-brand">
                  audit, and trust.
                </span>
              </h2>
              <p className="mt-4 max-w-xl text-pretty text-base text-foreground-muted md:text-lg">
                Three ways to start. Same engine. Same policy layer. Same
                audit trail.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="px-6">
                  <a
                    href="https://github.com/sachncs/revex"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Sparkles className="size-4" />
                    Start free
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" size="lg" className="px-6">
                  <a
                    href="https://github.com/sachncs/revex/blob/master/README.md"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <GitBranch className="size-4" />
                    Self-host guide
                  </a>
                </Button>
                <Button asChild variant="ghost" size="lg" className="px-6">
                  <a
                    href="https://github.com/sachncs/revex/issues"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessagesSquare className="size-4" />
                    Talk to the team
                  </a>
                </Button>
              </div>

              <p className="mt-8 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-foreground-muted">
                <span>Free, MIT-licensed core.</span>
                <span aria-hidden>·</span>
                <span>No vendor lock-in.</span>
                <span aria-hidden>·</span>
                <span>Bring your own LLM.</span>
              </p>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}