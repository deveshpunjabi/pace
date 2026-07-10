'use client';

import type { StadiumSector } from '@/types';

function sectorClass(density: number): string {
  if (density >= 85) {
    return 'border-red-300 bg-red-500/25 text-red-100 animate-pulse';
  }

  if (density >= 60) {
    return 'border-yellow-300 bg-yellow-400/20 text-yellow-100';
  }

  return 'border-emerald-300 bg-emerald-400/20 text-emerald-100';
}

export interface OpsMapProps {
  sectors: StadiumSector[];
}

export function OpsMap({ sectors }: OpsMapProps): React.ReactElement {
  return (
    <section aria-labelledby="ops-map-heading" className="relative grid gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Live Ops Map</p>
        <h2 id="ops-map-heading" className="text-2xl font-black text-white">Crowd Density Grid</h2>
      </div>
      <div className="grid min-h-[520px] grid-cols-3 gap-3">
        {sectors.map((sector) => (
          <article className={`rounded-lg border p-4 ${sectorClass(sector.density)}`} key={sector.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black">{sector.name}</h3>
                <p className="text-sm opacity-80">{sector.id}</p>
              </div>
              <strong className="text-2xl">{sector.density}%</strong>
            </div>
            <div
              aria-label={`${sector.name} density ${sector.density}%`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={sector.density}
              className="mt-5 h-3 overflow-hidden rounded-full bg-slate-950/70"
              role="progressbar"
            >
              <div className="h-full rounded-full bg-current" style={{ width: `${sector.density}%` }} />
            </div>
            <p className="mt-4 text-sm font-bold">HVAC: {sector.hvacStatus}</p>
          </article>
        ))}
      </div>
      <svg aria-hidden="true" className="pointer-events-none absolute left-1/3 top-1/2 h-32 w-56 text-cyan-300/70">
        <path d="M10 70 C80 20 140 20 210 70" fill="none" stroke="currentColor" strokeDasharray="10 8" strokeWidth="4" />
        <path d="M200 58 L214 70 L198 82" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
    </section>
  );
}
