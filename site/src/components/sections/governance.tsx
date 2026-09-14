import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody } from '@/components/ui/card';
import { POLICY_DECISIONS, POLICY_LINES } from '@/data/content';
import { cn } from '@/lib/utils';

const DECISION_STYLES: Record<'allow' | 'redact' | 'deny', string> = {
  allow: 'bg-emerald/15 text-emerald',
  redact: 'bg-amber/15 text-amber',
  deny: 'bg-rose/15 text-rose',
};

const DECISION_LABEL: Record<'allow' | 'redact' | 'deny', string> = {
  allow: 'allow',
  redact: 'redact',
  deny: 'deny',
};

export function Governance() {
  return (
    <section
      id="governance"
      className="relative isolate overflow-hidden py-16 md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-[420px] w-[600px] rounded-full bg-emerald/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 grid-faint opacity-30 mask-fade-b"
      />

      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="success" className="mb-3">
            <ShieldCheck className="size-3" />
            Governance
          </Badge>
          <h2 className="text-h1 text-balance text-foreground">
            Document-level access control, enforced before ranking.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-base text-foreground-muted md:text-lg">
            Policies are first-class. They govern which sources are queried,
            which documents can return, and which fields survive to the
            answer — per requester, per query.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[5fr_4fr]">
          <PolicyEditor />
          <PolicyScope />
        </div>
      </div>
    </section>
  );
}

function PolicyEditor() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card variant="elevated" className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-soft bg-background/40 px-4 py-2.5 text-xs text-foreground-muted">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald" />
            policy.revex · main
          </div>
          <span className="text-eyebrow">Policy editor</span>
        </div>
        <pre className="overflow-x-auto p-6 font-mono text-sm leading-relaxed">
          <code className="block">
            {POLICY_LINES.map((line, i) => (
              <span key={i} className="block">
                {line.map((tok, j) => (
                  <span key={j} className={tok.cls}>
                    {tok.text}
                  </span>
                ))}
              </span>
            ))}
            <span className="mt-2 inline-block size-2 animate-pulse rounded-full bg-emerald align-middle" />
          </code>
        </pre>
        <div className="flex items-center justify-between gap-3 border-t border-border-soft bg-background/40 px-4 py-2 text-xs text-foreground-muted">
          <Badge variant="success" className="gap-1.5">
            <Check className="size-3" />
            Saved · policy.lint passed
          </Badge>
          <span className="font-mono">+ rule</span>
        </div>
      </Card>
    </motion.div>
  );
}

function PolicyScope() {
  const allow = POLICY_DECISIONS.filter((r) => r.decision === 'allow').length;
  const redact = POLICY_DECISIONS.filter((r) => r.decision === 'redact').length;
  const deny = POLICY_DECISIONS.filter((r) => r.decision === 'deny').length;

  return (
    <div className="flex flex-col gap-3">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, delay: 0.05 }}
      >
        <Card>
          <CardBody className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-emerald/10 text-emerald ring-1 ring-inset ring-emerald/20">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <div className="text-sm font-medium text-foreground">
                  Policy decision
                </div>
                <div className="text-xs text-foreground-muted">
                  {allow} allow · {redact} redact · {deny} deny
                </div>
              </div>
            </div>
            <Badge variant="success">in scope</Badge>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, delay: 0.1 }}
      >
        <Card>
          <ul className="flex flex-col divide-y divide-border-soft">
            {POLICY_DECISIONS.map((row) => (
              <li key={row.id} className="flex items-center gap-3 p-3">
                <span
                  className={cn(
                    'inline-flex h-7 items-center justify-center rounded-md px-2 text-[11px] font-medium uppercase tracking-wider ring-1 ring-inset',
                    DECISION_STYLES[row.decision],
                  )}
                >
                  {DECISION_LABEL[row.decision]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {row.title}
                  </div>
                  <div className="truncate text-xs text-foreground-muted">
                    {row.source}
                  </div>
                </div>
                <span className="hidden rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-foreground-muted sm:inline">
                  {row.reason}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>

      <Accordion />
    </div>
  );
}

function Accordion() {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: 0.15 }}
      className="overflow-hidden rounded-2xl border border-dashed border-border bg-surface/30"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
      >
        Default-deny safe mode
        <ChevronDown
          className={cn(
            'size-4 text-foreground-muted transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        className={cn(
          'grid overflow-hidden transition-all duration-300 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0">
          <div className="px-4 pb-4 text-xs leading-relaxed text-foreground-muted">
            Documents without a matching rule are excluded from retrieval
            results, never silently allowed. Override per-document with an
            explicit{' '}
            <code className="rounded bg-foreground/5 px-1 font-mono">allow</code>{' '}
            rule.
          </div>
        </div>
      </div>
    </motion.div>
  );
}