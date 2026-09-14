import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Database,
  Eye,
  FileText,
  GitBranch,
  Layers,
  LineChart,
  Radar,
  ServerCog,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  AUDIT,
  PLATFORM_TILES,
  RETRIEVAL,
  ROUTING,
  SOURCES,
} from '@/data/content';

type Tab = 'overview' | 'sources' | 'routing' | 'retrieval' | 'audit';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'sources', label: 'Sources' },
  { id: 'routing', label: 'Routing' },
  { id: 'retrieval', label: 'Retrieval' },
  { id: 'audit', label: 'Audit' },
];

const STATUS_BADGE: Record<'allow' | 'redact' | 'deny', string> = {
  allow: 'bg-emerald/10 text-emerald',
  redact: 'bg-amber/10 text-amber',
  deny: 'bg-rose/10 text-rose',
};

export function Platform() {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <section
      id="platform"
      className="relative isolate py-16 md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px divider-gradient"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/3 -z-10 h-[460px] w-[600px] rounded-full bg-primary/10 blur-3xl"
      />

      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="primary" className="mb-3">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            Platform
          </Badge>
          <h2 className="text-h1 text-balance text-foreground">
            The retrieval layer your team will actually own.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-base text-foreground-muted md:text-lg">
            Eight subsystems, one engine. Designed to be inspected, extended,
            and operated by humans — not black boxes.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14"
        >
          <Card variant="elevated" className="overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center justify-between border-b border-border-soft bg-background/40 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-rose/70" />
                <span className="size-2.5 rounded-full bg-amber/70" />
                <span className="size-2.5 rounded-full bg-emerald/70" />
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground-muted">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-background/60 px-2 py-0.5 font-mono">
                  <Eye className="size-3" />
                  workspace · prod
                </span>
              </div>
              <Badge variant="success" className="gap-1.5">
                <ShieldCheck className="size-3" />
                sealed
              </Badge>
            </div>

            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Platform preview"
              className="flex items-center gap-1 overflow-x-auto border-b border-border-soft bg-background/30 px-4 py-2"
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'inline-flex h-7 items-center rounded-md px-3 text-xs font-medium transition-colors',
                    tab === t.id
                      ? 'bg-foreground/5 text-foreground ring-1 ring-inset ring-border'
                      : 'text-foreground-muted hover:text-foreground',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                {tab === 'overview' && (
                  <TabPanel key="overview">
                    <OverviewPane />
                  </TabPanel>
                )}
                {tab === 'sources' && (
                  <TabPanel key="sources">
                    <SourcesTable />
                  </TabPanel>
                )}
                {tab === 'routing' && (
                  <TabPanel key="routing">
                    <RoutingTable />
                  </TabPanel>
                )}
                {tab === 'retrieval' && (
                  <TabPanel key="retrieval">
                    <RetrievalTable />
                  </TabPanel>
                )}
                {tab === 'audit' && (
                  <TabPanel key="audit">
                    <AuditTable />
                  </TabPanel>
                )}
              </AnimatePresence>
            </div>

            <Separator />
            <div className="flex flex-wrap items-center justify-between gap-3 bg-background/40 px-4 py-2 text-[11px] text-foreground-muted">
              <span className="inline-flex items-center gap-1.5">
                <Database className="size-3" />
                workspace.db · 4.2 GB · 12 ms p95
              </span>
              <span className="inline-flex items-center gap-1.5">
                <GitBranch className="size-3" />
                graph · 8.4k entities · 12 communities
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="size-3" />
                3 members · 2 roles
              </span>
            </div>
          </Card>
        </motion.div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_TILES.map((tile, i) => (
            <motion.div
              key={tile.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
            >
              <Card className="group h-full transition-all hover:-translate-y-0.5 hover:ring-foreground/20">
                <CardBody className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary ring-1 ring-inset ring-primary/15">
                      <tile.icon className="size-4" />
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'uppercase tracking-wider',
                        tile.status === 'stable' &&
                          'bg-emerald/10 text-emerald',
                        tile.status === 'beta' && 'bg-amber/10 text-amber',
                        tile.status === 'alpha' && 'bg-rose/10 text-rose',
                      )}
                    >
                      {tile.status}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {tile.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground-muted">
                    {tile.description}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}

          <Card variant="ghost" className="group h-full border-dashed transition-all hover:bg-surface-strong">
            <CardBody className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-foreground/5 text-foreground-muted">
                  <ServerCog className="size-4" />
                </span>
                <Badge variant="outline">self-host</Badge>
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Self-host
              </h3>
              <p className="text-sm leading-relaxed text-foreground-muted">
                Single binary. Docker, Podman, systemd unit, or k8s.
                Air-gap-friendly.
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <HelperTile
            icon={LineChart}
            highlight="Probes and metrics"
            detail="emit OpenTelemetry. Wire into Datadog, Honeycomb, Grafana."
          />
          <HelperTile
            icon={Eye}
            highlight="Trace every retrieval"
            detail="with policy decision, sources, and latency breakdown."
          />
          <HelperTile
            icon={ShieldCheck}
            highlight="Webhook hooks"
            detail="fire on ingest, query, and audit events."
          />
        </div>
      </div>
    </section>
  );
}

function TabPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
      className="bg-background/40"
    >
      {children}
    </motion.div>
  );
}

function OverviewPane() {
  return (
    <div className="grid grid-cols-1 gap-px bg-border-soft md:grid-cols-12">
      <Pane title="Sources" icon={Layers}>
        <ul className="flex flex-col gap-1.5">
          {SOURCES.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-2 rounded-md border border-border-soft bg-background px-2 py-1.5 text-xs"
            >
              <span
                className={cn(
                  'size-1.5 shrink-0 rounded-full',
                  s.status === 'ok' && 'bg-emerald',
                  s.status === 'warn' && 'bg-amber',
                  s.status === 'down' && 'bg-rose',
                )}
                aria-hidden
              />
              <span className="truncate text-foreground">{s.name}</span>
              <span className="ml-auto text-foreground-muted">{s.kind}</span>
            </li>
          ))}
        </ul>
      </Pane>

      <Pane title="Query routing" icon={Radar}>
        <ul className="flex flex-col gap-2">
          {ROUTING.map((r) => (
            <li key={r.id} className="flex items-center gap-2 text-xs">
              <span className="w-16 text-foreground-muted">{r.label}</span>
              <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/5">
                <span
                  className="absolute inset-y-0 left-0 rounded-full gradient-brand"
                  style={{ width: `${Math.round(r.weight * 100)}%` }}
                />
              </span>
              <span className="w-10 text-right font-mono text-foreground">
                {(r.weight * 100).toFixed(0)}
              </span>
            </li>
          ))}
        </ul>
      </Pane>

      <Pane title="Retrieval" icon={FileText}>
        <ul className="flex flex-col gap-1.5">
          {RETRIEVAL.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-2 rounded-md border border-border-soft bg-background px-2 py-1.5 text-xs"
            >
              <FileText className="size-3 shrink-0 text-foreground-muted" />
              <span className="truncate text-foreground">{row.title}</span>
              <span className="ml-auto inline-flex items-center gap-1.5 text-foreground-muted">
                <span className="font-mono">{row.score.toFixed(2)}</span>
                <span
                  className={cn(
                    'inline-flex h-5 items-center rounded px-1.5 text-[10px] font-medium uppercase tracking-wider',
                    STATUS_BADGE[row.status],
                  )}
                >
                  {row.status}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Pane>

      <Pane title="Audit" icon={Clock}>
        <ul className="flex flex-col gap-1.5">
          {AUDIT.slice(0, 3).map((row) => (
            <li
              key={row.id}
              className="rounded-md border border-border-soft bg-background px-2 py-1.5 text-[10px] leading-snug"
            >
              <div className="flex items-center gap-1 font-mono text-foreground-muted">
                <span>{row.time}</span>
                <span className="truncate text-foreground">{row.action}</span>
              </div>
              <div className="truncate text-foreground-faint">{row.actor}</div>
            </li>
          ))}
        </ul>
      </Pane>
    </div>
  );
}

function SourcesTable() {
  return (
    <DataTable headers={['Name', 'Kind', 'Status']}>
      {SOURCES.map((s) => (
        <tr key={s.id} className="border-t border-border-soft">
          <td className="px-4 py-3 font-mono text-xs text-foreground">
            {s.name}
          </td>
          <td className="px-4 py-3 text-foreground-soft">{s.kind}</td>
          <td className="px-4 py-3">
            <span
              className={cn(
                'inline-flex h-6 items-center rounded-md px-2 text-[10px] font-medium uppercase tracking-wider ring-1 ring-inset',
                s.status === 'ok' &&
                  'bg-emerald/10 text-emerald ring-emerald/20',
                s.status === 'warn' && 'bg-amber/10 text-amber ring-amber/20',
                s.status === 'down' && 'bg-rose/10 text-rose ring-rose/20',
              )}
            >
              {s.status}
            </span>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}

function RoutingTable() {
  return (
    <DataTable headers={['Source', 'Weight']}>
      {ROUTING.map((r) => (
        <tr key={r.id} className="border-t border-border-soft">
          <td className="px-4 py-3 font-mono text-xs text-foreground">
            {r.label}
          </td>
          <td className="px-4 py-3 text-right">
            <div className="flex items-center gap-2">
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/5">
                <span
                  className="absolute inset-y-0 left-0 rounded-full gradient-brand"
                  style={{ width: `${Math.round(r.weight * 100)}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono text-foreground">
                {(r.weight * 100).toFixed(0)}%
              </span>
            </div>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}

function RetrievalTable() {
  return (
    <DataTable headers={['Document', 'Source', 'Score', 'Status']}>
      {RETRIEVAL.map((row) => (
        <tr key={row.id} className="border-t border-border-soft">
          <td className="px-4 py-3 font-medium text-foreground">{row.title}</td>
          <td className="px-4 py-3 text-foreground-muted">{row.source}</td>
          <td className="px-4 py-3 text-right font-mono text-foreground">
            {row.score.toFixed(2)}
          </td>
          <td className="px-4 py-3">
            <span
              className={cn(
                'inline-flex h-6 items-center rounded px-1.5 text-[10px] font-medium uppercase tracking-wider ring-1 ring-inset',
                row.status === 'allow' &&
                  'bg-emerald/10 text-emerald ring-emerald/20',
                row.status === 'redact' &&
                  'bg-amber/10 text-amber ring-amber/20',
                row.status === 'deny' && 'bg-rose/10 text-rose ring-rose/20',
              )}
            >
              {row.status}
            </span>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}

function AuditTable() {
  return (
    <DataTable headers={['Time', 'Actor', 'Action']}>
      {AUDIT.map((row) => (
        <tr key={row.id} className="border-t border-border-soft">
          <td className="px-4 py-3 font-mono text-xs text-foreground-soft">
            {row.time}
          </td>
          <td className="px-4 py-3 text-foreground-muted">{row.actor}</td>
          <td className="px-4 py-3 text-foreground">{row.action}</td>
        </tr>
      ))}
    </DataTable>
  );
}

function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-foreground/[0.02]">
        <tr>
          {headers.map((h, i) => (
            <th
              key={h}
              className={cn(
                'px-4 py-2.5 text-left text-eyebrow text-foreground-faint',
                i === headers.length - 1 && 'text-right',
              )}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

interface PaneProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function Pane({ title, icon: Icon, children }: PaneProps) {
  return (
    <div className="col-span-12 flex flex-col gap-3 bg-background/40 p-4 md:col-span-3">
      <div className="flex items-center justify-between">
        <span className="text-eyebrow text-foreground-faint">{title}</span>
        <Icon className="size-3.5 text-foreground-muted" />
      </div>
      {children}
    </div>
  );
}

function HelperTile({
  icon: Icon,
  highlight,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  highlight: string;
  detail: string;
}) {
  return (
    <Card variant="ghost">
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