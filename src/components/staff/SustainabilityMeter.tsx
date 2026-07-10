import type { StadiumSector } from '@/types';

export interface SustainabilityMeterProps {
  sectors: StadiumSector[];
}

export function SustainabilityMeter({ sectors }: SustainabilityMeterProps): React.ReactElement {
  const reducedCount = sectors.filter((sector) => sector.hvacStatus === 'reduced').length;
  const score = Math.round((reducedCount / sectors.length) * 100);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <section aria-labelledby="sustainability-heading" className="grid gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Environment</p>
        <h2 id="sustainability-heading" className="text-xl font-black text-white">Sustainability Meter</h2>
      </div>
      <div className="grid place-items-center rounded-lg border border-slate-700 bg-slate-950 p-5">
        <svg aria-label={`HVAC reduction score ${score}%`} className="h-36 w-36" role="img" viewBox="0 0 100 100">
          <circle cx="50" cy="50" fill="none" r="42" stroke="#1e293b" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            fill="none"
            r="42"
            stroke="#34d399"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth="10"
            transform="rotate(-90 50 50)"
          />
          <text fill="#e2e8f0" fontSize="18" fontWeight="800" textAnchor="middle" x="50" y="55">
            {score}%
          </text>
        </svg>
        <p className="mt-3 text-center text-sm text-slate-300">{reducedCount} low-density sectors are using reduced HVAC power.</p>
      </div>
    </section>
  );
}
