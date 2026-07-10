'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Accessibility, ArrowRight, Cpu, Gauge, Languages, Leaf, Radio, ShieldCheck, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const capabilities = [
  { icon: Languages, label: 'Multilingual' },
  { icon: Accessibility, label: 'Accessibility' },
  { icon: ShieldCheck, label: 'Crowd Safety' },
  { icon: Leaf, label: 'Sustainability' }
];

const flow = [
  {
    icon: Radio,
    title: 'Sense',
    body: 'Live sensor-style signals stream in from every sector — density, flow trend, and HVAC state across the venue.'
  },
  {
    icon: Cpu,
    title: 'Decide',
    body: 'PACE reasons over the live context and drafts grounded, multilingual guidance and prioritized mitigation plans.'
  },
  {
    icon: Zap,
    title: 'Act',
    body: 'Staff execute AI actions — redirect crowds, cut idle HVAC — and watch the venue state respond in real time.'
  }
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
};

export default function HomePage(): React.ReactElement {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div aria-hidden="true" className="grid-overlay pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-sm font-black text-slate-950">
              P
            </span>
            <span className="text-lg font-black tracking-tight text-white">PACE</span>
          </div>
          <Badge tone="accent">FIFA World Cup 2026</Badge>
        </header>

        <motion.section
          animate="show"
          className="grid gap-6 py-14 text-center sm:py-20"
          initial="hidden"
          variants={container}
        >
          <motion.p className="text-xs font-black uppercase tracking-[0.34em] text-cyan-300" variants={item}>
            Smart Stadiums &amp; Tournament Operations
          </motion.p>
          <motion.h1
            className="text-gradient mx-auto max-w-4xl text-6xl font-black leading-[0.95] tracking-tight sm:text-8xl"
            variants={item}
          >
            Predictive AI for Crowd &amp; Environment
          </motion.h1>
          <motion.p className="mx-auto max-w-2xl text-lg text-slate-300" variants={item}>
            PACE is the GenAI operations layer for the world&apos;s biggest matches — guiding every fan in their
            language and giving venue teams real-time decisions on crowd safety and sustainability.
          </motion.p>
          <motion.div className="mx-auto flex flex-wrap items-center justify-center gap-2" variants={item}>
            {capabilities.map(({ icon: Icon, label }) => (
              <span
                className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-200"
                key={label}
              >
                <Icon className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                {label}
              </span>
            ))}
          </motion.div>
        </motion.section>

        <section aria-labelledby="flow-heading" className="pb-14">
          <h2 className="sr-only" id="flow-heading">
            How PACE works
          </h2>
          <motion.div
            className="grid gap-4 md:grid-cols-3"
            initial="hidden"
            variants={container}
            viewport={{ once: true, amount: 0.3 }}
            whileInView="show"
          >
            {flow.map(({ icon: Icon, title, body }, index) => (
              <motion.article className="glass rounded-2xl p-6" key={title} variants={item}>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Step {index + 1}</span>
                </div>
                <h3 className="mt-4 text-xl font-black text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section aria-labelledby="roles-heading" className="pb-16">
          <h2
            className="mb-4 text-center text-sm font-black uppercase tracking-[0.24em] text-slate-500"
            id="roles-heading"
          >
            Choose your experience
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <motion.div
              className="glass-strong group relative overflow-hidden rounded-3xl p-7"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                  <Users className="h-6 w-6" aria-hidden="true" />
                </span>
                <Badge tone="accent">Fan &amp; Family</Badge>
              </div>
              <h3 className="mt-5 text-2xl font-black text-white">Fan Concierge</h3>
              <p className="mt-1 text-sm text-slate-400">
                For visitors, families, and accessibility-first guests. Ask anything in English, Spanish, or French and
                get grounded routes, low-queue amenities, transit, and stadium policy in seconds.
              </p>
              <ul className="mt-4 grid gap-1.5 text-sm text-slate-300">
                <li>· Accessible wayfinding to your section</li>
                <li>· Nearest food &amp; restrooms by live crowd</li>
                <li>· Post-match transit &amp; safe exit guidance</li>
              </ul>
              <Button asChild aria-label="Open the fan concierge" className="mt-6 w-full">
                <Link href="/fan">
                  Enter as a Fan <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              className="glass-strong group relative overflow-hidden rounded-3xl p-7"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-400/15 text-red-300">
                  <Gauge className="h-6 w-6" aria-hidden="true" />
                </span>
                <Badge tone="critical">Operations</Badge>
              </div>
              <h3 className="mt-5 text-2xl font-black text-white">Staff Command Center</h3>
              <p className="mt-1 text-sm text-slate-400">
                For control-room operators and volunteers. Monitor live KPIs and a sector heatmap, triage prioritized
                alerts, and execute AI mitigation with one click.
              </p>
              <ul className="mt-4 grid gap-1.5 text-sm text-slate-300">
                <li>· Live density heatmap &amp; venue KPIs</li>
                <li>· Prioritized crowd &amp; sustainability alerts</li>
                <li>· One-click AI actions that update the venue</li>
              </ul>
              <Button asChild aria-label="Open the staff command center" className="mt-6 w-full" variant="danger">
                <Link href="/staff">
                  Enter as Staff <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
          Demo runs in safe mock-AI mode · Production path uses server-side Vertex AI · Built for Challenge 4
        </footer>
      </div>
    </main>
  );
}
