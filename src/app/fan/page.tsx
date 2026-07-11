/**
 * @module app/fan/page
 *
 * Mobile fan landing page. Displays a compact density mini-map of all sectors
 * and the FanChat concierge below it. Serves as the entry point for the
 * fan persona journey.
 */

import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { FanChat } from '@/components/fan/FanChat';
import { VenueMap } from '@/components/fan/VenueMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VENUE_NAME } from '@/lib/data/venue';
import { generateLiveSignals } from '@/lib/simulation/liveSignals';

/** Fan mobile page with a live accessible route map and AI concierge chat. */
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
          <VenueMap sectors={sectors} />
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
