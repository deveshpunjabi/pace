import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FanChat } from '@/components/fan/FanChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { initializeSectors } from '@/lib/data/mockData';

function sectorColor(density: number): string {
  if (density > 85) {
    return 'bg-red-500';
  }

  if (density >= 60) {
    return 'bg-yellow-400';
  }

  return 'bg-emerald-400';
}

export default function FanPage(): React.ReactElement {
  const sectors = initializeSectors();

  return (
    <main className="mx-auto grid min-h-screen max-w-xl gap-4 px-4 py-5">
      <Button asChild aria-label="Return to PACE role selection" className="w-fit" variant="ghost">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
        </Link>
      </Button>

      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Live Stadium Map</p>
          <div className="mt-3 grid grid-cols-3 gap-2" aria-label="Mobile density map">
            {sectors.map((sector) => (
              <div className="rounded-lg bg-slate-950 p-2" key={sector.id}>
                <div
                  aria-label={`${sector.name} density ${sector.density}%`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={sector.density}
                  className={`h-16 rounded-md ${sectorColor(sector.density)}`}
                  role="progressbar"
                />
                <p className="mt-2 text-xs font-bold text-slate-300">{sector.id} {sector.density}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[58vh]">
        <CardContent className="h-full p-4">
          <FanChat />
        </CardContent>
      </Card>
    </main>
  );
}
