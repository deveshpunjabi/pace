import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { FanChat } from '@/components/fan/FanChat';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VENUE_NAME } from '@/lib/data/venue';
import { generateLiveSignals } from '@/lib/simulation/liveSignals';

function sectorColor(density: number): string {
  if (density >= 85) {
    return 'bg-red-400';
  }

  if (density >= 60) {
    return 'bg-amber-400';
  }

  return 'bg-emerald-400';
}

export default function FanPage(): React.ReactElement {
  const sectors = generateLiveSignals();

  return (
    <main className="mx-auto grid min-h-screen max-w-xl gap-4 px-4 py-5">
      <div className="flex items-center justify-between">
        <Button asChild aria-label="Return to PACE role selection" className="w-fit" variant="ghost">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </Link>
        </Button>
        <Badge tone="accent">
          <MapPin className="h-3 w-3" aria-hidden="true" /> {VENUE_NAME}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300">Live crowd near you</p>
          <div className="mt-3 grid grid-cols-3 gap-2" aria-label="Mobile density map">
            {sectors.map((sector) => (
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-2" key={sector.id}>
                <div
                  aria-label={`${sector.name} density ${sector.density}%`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={sector.density}
                  className={`h-12 rounded-lg ${sectorColor(sector.density)}`}
                  role="progressbar"
                />
                <p className="mt-1.5 truncate text-[11px] font-bold text-slate-300">
                  {sector.id} · {sector.density}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[62vh]">
        <CardContent className="h-full p-4">
          <FanChat />
        </CardContent>
      </Card>
    </main>
  );
}
