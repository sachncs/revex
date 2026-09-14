import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FAQS } from '@/data/content';
import { cn } from '@/lib/utils';

export function Faq() {
  return (
    <section className="relative isolate py-16 md:py-24">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <Badge variant="default" className="mb-3">
              FAQ
            </Badge>
            <h2 className="text-h1 text-balance text-foreground">
              Questions teams ask before they switch.
            </h2>
            <p className="mt-3 max-w-md text-pretty text-base text-foreground-muted md:text-lg">
              The short answers to the ones that come up most often during
              evaluations.
            </p>
          </div>
          <ul className="flex flex-col divide-y divide-border-soft border-y border-border-soft">
            {FAQS.map((item, i) => (
              <FaqItem key={item.q} q={item.q} a={item.a} index={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FaqItem({
  q,
  a,
  index,
}: {
  q: string;
  a: string;
  index: number;
}) {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="group"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="text-base font-medium text-foreground md:text-lg">
          {q}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-foreground-muted transition-transform duration-300',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        className={cn(
          'grid overflow-hidden transition-all duration-300 ease-out',
          open ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0">
          <p className="max-w-2xl text-sm leading-relaxed text-foreground-muted md:text-base">
            {a}
          </p>
        </div>
      </div>
    </motion.li>
  );
}