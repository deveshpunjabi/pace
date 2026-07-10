/**
 * @module components/staff/SustainabilityMeter
 *
 * SVG ring gauge showing the venue's HVAC reduction sustainability score.
 * Displays what percentage of sectors are running on reduced power, giving
 * staff a visual indicator of energy savings progress.
 */

import type { StadiumSector } from '@/types';

/** SVG circle radius for the sustainability gauge ring. */
const RING_RADIUS = 42;

/** SVG stroke width for the gauge ring. */
const RING_STROKE_WIDTH = 9;

/** Full circumference of the gauge ring (2πr). */
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Props for the SustainabilityMeter component. */
export interface SustainabilityMeterProps {
  readonly sectors: StadiumSector[];
}

/** SVG ring gauge displaying the venue's HVAC reduction sustainability score. */
export function SustainabilityMeter({ sectors }: SustainabilityMeterProps): React.ReactElement {
  const reducedCount = sectors.filter((sector) => sector.hvacStatus === 'reduced').length;
  const score = sectors.length === 0 ? 0 : Math.round((reducedCount / sectors.length) * 100);
  const offset = RING_CIRCUMFERENCE - (score / 100) * RING_CIRCUMFERENCE;

  return (
    <section aria-labelledby="sustainability-heading" className="grid gap-3">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">Environment</p>
        <h2 id="sustainability-heading" className="text-xl font-black text-white">
          Sustainability Meter
        </h2>
      </div>
      <div className="grid place-items-center rounded-xl border border-white/10 bg-slate-950/50 p-5">
        <svg aria-label={`HVAC reduction score ${score}%`} className="h-32 w-32" role="img" viewBox="0 0 100 100">
          <circle cx="50" cy="50" fill="none" r={RING_RADIUS} stroke="#1e293b" strokeWidth={RING_STROKE_WIDTH} />
          <circle
            cx="50"
            cy="50"
            fill="none"
            r={RING_RADIUS}
            stroke="#34d399"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth={RING_STROKE_WIDTH}
            transform="rotate(-90 50 50)"
          />
          <text fill="#e2e8f0" fontSize="18" fontWeight="800" textAnchor="middle" x="50" y="55">
            {score}%
          </text>
        </svg>
        <p className="mt-3 text-center text-sm text-slate-400">
          {reducedCount} low-density sectors are running on reduced HVAC power.
        </p>
      </div>
    </section>
  );
}
