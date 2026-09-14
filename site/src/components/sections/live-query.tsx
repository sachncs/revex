import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, LoaderCircle, ScanSearch, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { Card } from '@/components/ui/card';
import { DEMO_ANSWERS, DEMO_QUERIES } from '@/data/content';
import { cn } from '@/lib/utils';

type TraceStep = {
  id: string;
  label: string;
  detail: string;
  accent: 'indigo' | 'amber' | 'emerald';
};

type DemoKey = (typeof DEMO_QUERIES)[number];

const ACCENT_DOT: Record<TraceStep['accent'], string> = {
  indigo: 'bg-indigo',
  amber: 'bg-amber',
  emerald: 'bg-emerald',
};

export function LiveQuery() {
  const [value, setValue] = useState('');
  const [activeDemo, setActiveDemo] = useState<DemoKey | null>(null);
  const [streamedText, setStreamedText] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const startedAt = useRef<number | null>(null);

  const submit = useCallback((question: string) => {
    const q = question.trim();
    if (!q || streaming) return;
    const match = DEMO_QUERIES.find(
      (k) => q.toLowerCase() === k.toLowerCase(),
    );
    if (!match) return;
    setValue('');
    setActiveDemo(match);
    setStreamedText('');
    setLatency(null);
    startedAt.current = performance.now();
    setStreaming(true);

    const start = performance.now();
    const target = DEMO_ANSWERS[match].answer;
    let i = 0;
    const tick = () => {
      i = Math.min(target.length, i + 2);
      setStreamedText(target.slice(0, i));
      if (i >= target.length) {
        setLatency(Math.round(performance.now() - start));
        setStreaming(false);
        return;
      }
      setTimeout(tick, 12);
    };
    tick();
  }, [streaming]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const first = DEMO_QUERIES[0];
        if (first) submit(first);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [submit]);

  const trace = activeDemo ? DEMO_ANSWERS[activeDemo].trace : [];
  const showResult = Boolean(activeDemo) || streaming;

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="group relative flex items-center gap-2 rounded-2xl border border-border bg-surface-strong p-2 shadow-[0_1px_2px_oklch(0_0_0/0.04),0_24px_60px_-24px_oklch(0_0_0/0.18)] backdrop-blur-md transition-all focus-within:border-primary/40 focus-within:shadow-[0_0_0_4px_oklch(0_0_0/0)] focus-within:ring-4 focus-within:ring-primary/15"
      >
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          {streaming ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ScanSearch className="size-4" />
          )}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask anything about Revex…"
          aria-label="Demo query"
          className="flex-1 border-0 bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-foreground-faint focus:ring-0 disabled:opacity-60"
          disabled={streaming}
        />
        <KbdGroup className="hidden md:inline-flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <Button
          type="submit"
          size="sm"
          className="rounded-xl"
          disabled={streaming || !value.trim()}
        >
          {streaming ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <>
              <span className="hidden sm:inline">Ask</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {DEMO_QUERIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => submit(q)}
            disabled={streaming}
            className="group flex items-start gap-2 rounded-xl border border-border-soft bg-surface px-3 py-2.5 text-left text-xs text-foreground-muted transition-all hover:border-foreground/20 hover:bg-surface-strong hover:text-foreground disabled:opacity-50"
          >
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span className="line-clamp-2 leading-snug">{q}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4"
          >
            <Card variant="elevated" className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 border-b border-border-soft px-4 py-3 text-xs">
                <Badge variant="success" className="gap-1.5">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald opacity-60" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald" />
                  </span>
                  Live trace
                </Badge>
                {latency !== null && (
                  <Badge variant="accent" className="gap-1.5">
                    {latency} ms
                  </Badge>
                )}
                {activeDemo && (
                  <Badge variant="outline" className="ml-auto font-normal">
                    {DEMO_QUERIES.indexOf(activeDemo) + 1} / {DEMO_QUERIES.length}
                  </Badge>
                )}
              </div>

              <div className="space-y-3 p-5">
                {trace.length > 0 && (
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {trace.map((step, idx) => (
                      <li
                        key={step.label}
                        className="flex items-center gap-2 rounded-lg border border-border-soft bg-background/40 px-2.5 py-2 text-xs"
                      >
                        <span
                          className={cn(
                            'inline-flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold text-background',
                            ACCENT_DOT[
                              idx % 3 === 0
                                ? 'indigo'
                                : idx % 3 === 1
                                  ? 'amber'
                                  : 'emerald'
                            ],
                          )}
                          aria-hidden
                        >
                          {idx + 1}
                        </span>
                        <span className="font-medium text-foreground">
                          {step.label}
                        </span>
                        <span className="ml-auto font-mono text-[11px] text-foreground-muted">
                          {step.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="text-pretty text-sm leading-relaxed text-foreground md:text-[15px]">
                  {streamedText ||
                    (streaming && (
                      <span className="inline-flex items-center gap-1.5 text-foreground-muted">
                        <LoaderCircle className="size-3.5 animate-spin" />
                        Retrieving across 5 sources…
                      </span>
                    ))}
                  {streaming && streamedText && (
                    <span
                      className="ml-0.5 inline-block size-2 animate-pulse rounded-full bg-primary align-middle"
                      aria-hidden
                    />
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border-soft pt-3 text-xs text-foreground-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-emerald" />
                    Policy-scoped · redacted
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    Demo response
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}