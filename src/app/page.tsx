import Link from 'next/link';
import { ArrowRight, Headphones, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage(): React.ReactElement {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-10">
      <div aria-hidden="true" className="absolute inset-0 opacity-30">
        <div className="h-full w-full bg-[linear-gradient(#06b6d433_1px,transparent_1px),linear-gradient(90deg,#06b6d433_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <section className="relative z-10 grid w-full max-w-5xl gap-8 text-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">FIFA World Cup 2026</p>
          <h1 className="mt-4 bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-8xl">
            P.A.C.E.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Predictive AI for Crowd & Environment. Multilingual fan support, live crowd operations, and sustainability intelligence for smart stadium teams.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-cyan-400/30 bg-slate-900/80">
            <CardContent className="grid gap-5 p-6">
              <Headphones className="mx-auto h-10 w-10 text-cyan-300" aria-hidden="true" />
              <div>
                <h2 className="text-2xl font-black text-white">Fan Entrance</h2>
                <p className="mt-2 text-slate-400">Mobile-first concierge for EN/ES/FR navigation, accessibility, transit, and stadium rules.</p>
              </div>
              <Button asChild aria-label="Open fan concierge">
                <Link href="/fan">
                  Open Fan View <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-400/30 bg-slate-900/80">
            <CardContent className="grid gap-5 p-6">
              <ShieldCheck className="mx-auto h-10 w-10 text-red-300" aria-hidden="true" />
              <div>
                <h2 className="text-2xl font-black text-white">Staff Operations</h2>
                <p className="mt-2 text-slate-400">Desktop ops dashboard for density alerts, redirect plans, and HVAC energy reduction.</p>
              </div>
              <Button asChild aria-label="Open staff operations" variant="danger">
                <Link href="/staff">
                  Open Staff View <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
