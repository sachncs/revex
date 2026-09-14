import { Header } from '@/components/sections/header';
import { Hero } from '@/components/sections/hero';
import { TrustStrip } from '@/components/sections/trust-strip';
import { Capabilities } from '@/components/sections/capabilities';
import { Platform } from '@/components/sections/platform';
import { Governance } from '@/components/sections/governance';
import { Solutions } from '@/components/sections/solutions';
import { Faq } from '@/components/sections/faq';
import { FinalCta } from '@/components/sections/final-cta';
import { Footer } from '@/components/sections/footer';

export default function App() {
  return (
    <div className="relative min-h-svh overflow-x-clip">
      <BackgroundAura />
      <Header />
      <main id="main" className="flex flex-col">
        <Hero />
        <TrustStrip />
        <Capabilities />
        <Platform />
        <Governance />
        <Solutions />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

function BackgroundAura() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 gradient-mesh dark:gradient-mesh-dark opacity-60" />
      <div className="absolute inset-x-0 top-0 h-[60vh] bg-gradient-to-b from-background/40 to-transparent" />
      <div className="absolute inset-0 grid-faint opacity-40 mask-fade-b" />
      <div className="absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
    </div>
  );
}