'use client';

import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DensityTrend, StadiumSector } from '@/types';

function tone(density: number): { ring: string; bar: string; label: 'critical' | 'warn' | 'good' } {
  if (density >= 85) {
    return { ring: 'border-red-400/40 bg-red-500/10', bar: 'bg-red-400', label: 'critical' };
  }

  if (density >= 60) {
    return { ring: 'border-amber-400/40 bg-amber-500/10', bar: 'bg-amber-400', label: 'warn' };
  }

  return { ring: 'border-emerald-400/40 bg-emerald-500/10', bar: 'bg-emerald-400', label: 'good' };
}

function TrendIcon({ trend }: { trend: DensityTrend }): React.ReactElement {
  if (trend === 'rising') {
    return <ArrowUpRight className="h-4 w-4 text-red-300" aria-hidden="true" />;
  }

  if (trend === 'falling') {
    return <ArrowDownRight className="h-4 w-4 text-emerald-300" aria-hidden="true" />;
  }

  return <Minus className="h-4 w-4 text-slate-400" aria-hidden="true" />;
}

export interface OpsMapProps {
  sectors: StadiumSector[];
}

export function OpsMap({ sectors }: OpsMapProps): React.ReactElement {
  return (
    <section aria-labelledby="ops-map-heading" className="grid gap-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300">Live Ops Map</p>
          <h2 id="ops-map-heading" className="text-2xl font-black text-white">
            Crowd Density Grid
          </h2>
        </div>
        <Badge tone="accent">Refreshing live</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {sectors.map((sector) => {
          const { ring, bar, label } = tone(sector.density);
          const isCritical = sector.density >= 85;

          return (
            <article
              className={`rounded-2xl border p-4 transition ${ring} ${isCritical ? 'alert-pulse' : ''}`}
              key={sector.id}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black leading-tight text-white">{sector.name}</h3>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    {sector.id} · {sector.zone}
                  </p>
                </div>
                <TrendIcon trend={sector.trend} />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-3xl font-black text-white">{sector.density}%</span>
                <Badge tone={label}>{label}</Badge>
              </div>
              <div
                aria-label={`${sector.name} density ${sector.density}%`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={sector.density}
                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-950/70"
                role="progressbar"
              >
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${sector.density}%` }} />
              </div>
              <p className="mt-3 text-xs text-slate-400">HVAC: {sector.hvacStatus}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
