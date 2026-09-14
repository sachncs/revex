import { motion } from 'framer-motion';
import { Brain, FileText, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody } from '@/components/ui/card';
import { FEATURES } from '@/data/content';

export function Capabilities() {
  return (
    <section
      id="capabilities"
      className="relative isolate py-16 md:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 -z-10 h-[420px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
      />
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="primary" className="mb-3">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            Capabilities
          </Badge>
          <h2 className="text-h1 text-balance text-foreground">
            Every retrieval, every source — one engine.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-base text-foreground-muted md:text-lg">
            Revex fuses the modalities teams actually need to answer real
            questions, not the ones demos love to show.
          </p>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.5,
                delay: i * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                eyebrow={feature.eyebrow}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 grid gap-3 sm:grid-cols-3"
        >
          <PillCard
            icon={FileText}
            highlight="Ingest → Govern → Retrieve → Answer → Audit."
            detail="Five steps, one pipeline."
          />
          <PillCard
            icon={Brain}
            highlight="Knowledge base, copilots, support, research, compliance."
            detail="One engine, six surfaces."
          />
          <PillCard
            icon={ShieldCheck}
            highlight="Audit trail and retention"
            detail="built in, not bolted on."
          />
        </motion.div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  eyebrow: string;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  eyebrow,
}: FeatureCardProps) {
  return (
    <Card className="group relative h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:ring-foreground/20 hover:shadow-[0_24px_60px_-16px_oklch(0_0_0/0.12)]">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />
      <CardBody className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary ring-1 ring-inset ring-primary/15">
            <Icon className="size-5" />
          </span>
          <span className="font-mono text-[11px] tracking-wider text-foreground-faint">
            {eyebrow}
          </span>
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-foreground-muted">
          {description}
        </p>
      </CardBody>
    </Card>
  );
}

interface PillCardProps {
  icon: React.ComponentType<{ className?: string }>;
  highlight: string;
  detail: string;
}

function PillCard({ icon: Icon, highlight, detail }: PillCardProps) {
  return (
    <Card variant="ghost" className="h-full">
      <CardBody className="flex items-center gap-3 p-4 text-xs">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon className="size-4" />
        </span>
        <span className="text-foreground-muted">
          <span className="text-foreground">{highlight}</span> {detail}
        </span>
      </CardBody>
    </Card>
  );
}