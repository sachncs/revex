import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody } from '@/components/ui/card';
import { SOLUTIONS } from '@/data/content';

export function Solutions() {
  return (
    <section
      id="solutions"
      className="relative isolate py-16 md:py-24"
    >
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="accent" className="mb-3">
            <span className="size-1.5 rounded-full bg-amber" aria-hidden />
            Solutions
          </Badge>
          <h2 className="text-h1 text-balance text-foreground">
            One engine, every surface your team touches.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-base text-foreground-muted md:text-lg">
            From internal copilots to compliance-grade workflows, Revex
            ships the same retrieval primitives across every product surface
            you operate.
          </p>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((item, i) => (
            <motion.a
              key={item.title}
              href="#capabilities"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.5,
                delay: i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group"
            >
              <Card className="relative h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:ring-foreground/20 hover:shadow-[0_24px_60px_-16px_oklch(0_0_0/0.12)]">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                />
                <CardBody className="flex flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary ring-1 ring-inset ring-primary/15 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <item.icon className="size-5" />
                    </span>
                    <ArrowUpRight className="size-4 text-foreground-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-eyebrow text-foreground-faint">
                      {item.eyebrow}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-foreground-muted">
                      {item.description}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}