/**
 * @module app/fan/page
 *
 * Mobile fan landing page. Displays a compact density mini-map of all sectors
 * and the FanChat concierge below it. Serves as the entry point for the
 * fan persona journey.
 */

import Link from 'next/link';
import { ArrowLeft, Leaf, MapPin } from 'lucide-react';
import { FanChat } from '@/components/fan/FanChat';
import { VenueMap } from '@/components/fan/VenueMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VENUE_NAME } from '@/lib/data/venue';
import { generateLiveSignals, transitStatusAt } from '@/lib/simulation/liveSignals';

/** Fan mobile page with a live accessible route map, transit status, and AI concierge. */
export default function FanPage(): React.ReactElement {
  const sectors = generateLiveSignals();
  const transit = transitStatusAt();

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
          <VenueMap sectors={sectors} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <section aria-labelledby="transit-heading" className="grid gap-2">
            <p id="transit-heading" className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300">
              Live transit — wait times adjust for match phase
            </p>
            <ul className="grid gap-2">
              {transit.map((option) => (
                <li
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-950/50 p-2.5"
                  key={option.id}
                >
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                    {option.label}
                    {option.greenest ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                        <Leaf className="h-3 w-3" aria-hidden="true" /> greenest
                      </span>
                    ) : null}
                  </span>
                  <span className="text-right text-xs text-slate-400">
                    <span className="font-bold text-slate-200">{option.etaMinutes} min</span> · {option.load} ·{' '}
                    {option.carbonKgPerRider} kg CO₂
                  </span>
                </li>
              ))}
            </ul>
          </section>
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
