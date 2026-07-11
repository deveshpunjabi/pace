/**
 * @module components/fan/VenueMap
 *
 * Lightweight inline-SVG venue map for the fan concierge. Plots every sector
 * from the live snapshot color-coded by density and overlays the recommended
 * step-free route (North Gate Plaza → Accessible Lift A → South Lower Bowl /
 * Section 142). The non-accessible East Concourse (Gate C) is marked so the
 * navigation and accessibility guidance the concierge gives is also shown
 * visually — no map SDK, matching the app's lightweight-SVG approach.
 */

import type { StadiumSector } from '@/types';
import { CROWD_ALERT_THRESHOLD } from '@/lib/data/venue';

/** Density threshold for the amber (moderate) fill band. */
const MODERATE_DENSITY_THRESHOLD = 60;

/** Fixed layout position (viewBox units) and label anchor for each sector id. */
const SECTOR_LAYOUT: Readonly<Record<string, { readonly x: number; readonly y: number }>> = {
  S1: { x: 120, y: 18 }, // North Gate Plaza (top center)
  S2: { x: 232, y: 78 }, // East Concourse (right)
  S3: { x: 120, y: 150 }, // South Lower Bowl (bottom center)
  S4: { x: 12, y: 78 }, // West Transit Hub (left)
  S5: { x: 12, y: 150 }, // Family Services Corridor (bottom left)
  S6: { x: 232, y: 18 } // Upper Suite Ring (top right)
};

/** Sector card width in viewBox units. */
const CARD_W = 76;

/** Sector card height in viewBox units. */
const CARD_H = 52;

/** Returns the fill color for a sector based on its density band. */
function densityFill(density: number): string {
  if (density >= CROWD_ALERT_THRESHOLD) {
    return '#f87171'; // red-400
  }

  if (density >= MODERATE_DENSITY_THRESHOLD) {
    return '#fbbf24'; // amber-400
  }

  return '#34d399'; // emerald-400
}

/** Center point of a sector card, used to anchor the route polyline. */
function centerOf(id: string): { x: number; y: number } {
  const pos = SECTOR_LAYOUT[id] ?? { x: 0, y: 0 };
  return { x: pos.x + CARD_W / 2, y: pos.y + CARD_H / 2 };
}

/** Props for the VenueMap component. */
export interface VenueMapProps {
  readonly sectors: StadiumSector[];
}

/**
 * Inline-SVG venue map showing live sector density and the recommended
 * step-free route. Purely presentational — takes the live snapshot as a prop.
 */
export function VenueMap({ sectors }: VenueMapProps): React.ReactElement {
  const start = centerOf('S1'); // North Gate Plaza (step-free entry)
  const end = centerOf('S3'); // South Lower Bowl / Section 142
  // Route hugs the accessible west side (via Lift A) rather than crossing the
  // non-step-free East Concourse — the same fact the concierge reasons about.
  const via = { x: start.x - 44, y: (start.y + end.y) / 2 };

  return (
    <section aria-labelledby="venue-map-heading" className="grid gap-2">
      <p id="venue-map-heading" className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300">
        Accessible route map
      </p>
      <svg
        aria-label="Venue map showing the step-free route from North Gate Plaza via Accessible Lift A to South Lower Bowl, avoiding the non-accessible East Concourse."
        className="w-full"
        role="img"
        viewBox="0 0 320 220"
      >
        <polyline
          fill="none"
          points={`${start.x},${start.y} ${via.x},${via.y} ${end.x},${end.y}`}
          stroke="#22d3ee"
          strokeDasharray="6 5"
          strokeLinecap="round"
          strokeWidth={3}
        />

        {sectors.map((sector) => {
          const pos = SECTOR_LAYOUT[sector.id];

          if (!pos) {
            return null;
          }

          const stepFreeBlocked = sector.id === 'S2'; // East Concourse / Gate C

          return (
            <g key={sector.id}>
              <rect
                fill={densityFill(sector.density)}
                fillOpacity={0.22}
                height={CARD_H}
                rx={8}
                stroke={densityFill(sector.density)}
                strokeDasharray={stepFreeBlocked ? '3 3' : undefined}
                strokeWidth={1.5}
                width={CARD_W}
                x={pos.x}
                y={pos.y}
              />
              <text fill="#e2e8f0" fontSize={9} fontWeight={800} x={pos.x + 6} y={pos.y + 18}>
                {sector.id}
              </text>
              <text fill="#94a3b8" fontSize={8} x={pos.x + 6} y={pos.y + 32}>
                {sector.density}%
              </text>
              {stepFreeBlocked ? (
                <text fill="#fca5a5" fontSize={7} fontWeight={700} x={pos.x + 6} y={pos.y + 45}>
                  no step-free
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <p className="text-[11px] text-slate-400">
        Dashed line: step-free route via Accessible Lift A. East Concourse (Gate C) has no step-free path.
      </p>
    </section>
  );
}
