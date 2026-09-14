import { motion } from 'framer-motion';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { INTEGRATIONS, KPIS } from '@/data/content';

export function TrustStrip() {
  return (
    <section className="relative isolate py-16 md:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="default" className="mb-3">
            <span className="size-1.5 rounded-full bg-foreground-faint" aria-hidden />
            Operate with proof
          </Badge>
          <h2 className="text-h1 text-balance text-foreground">
            Built for teams who treat retrieval like infrastructure.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-base text-foreground-muted md:text-lg">
            Revex runs where you run. Every query is policy-gated, every
            answer is auditable, every byte stays on your perimeter.
          </p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {KPIS.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.5,
                delay: i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-16px_oklch(0_0_0/0.1)]">
                <CardBody className="space-y-1">
                  <div className="font-mono text-[2.25rem] leading-none font-semibold tracking-tight text-foreground md:text-5xl">
                    {kpi.value}
                  </div>
                  <div className="text-sm font-medium text-foreground-soft">
                    {kpi.label}
                  </div>
                  <div className="text-xs text-foreground-muted">
                    {kpi.detail}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <span className="text-eyebrow text-foreground-faint">
            Bring your own stack
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {INTEGRATIONS.map((name) => (
              <Badge
                key={name}
                variant="outline"
                className="font-mono text-[11px] uppercase tracking-wider"
              >
                {name}
              </Badge>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}