import * as React from 'react';
import { cn } from '@/lib/utils';
import type { KpiTone } from '@/types';

const toneAccent: Record<KpiTone, string> = {
  neutral: 'text-cyan-300',
  good: 'text-emerald-300',
  warn: 'text-amber-300',
  critical: 'text-red-300'
};

const toneBar: Record<KpiTone, string> = {
  neutral: 'bg-cyan-400',
  good: 'bg-emerald-400',
  warn: 'bg-amber-400',
  critical: 'bg-red-400'
};

export interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  tone?: KpiTone;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, hint, tone = 'neutral', icon }: StatCardProps): React.ReactElement {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4">
      <span className={cn('absolute left-0 top-0 h-full w-1', toneBar[tone])} aria-hidden="true" />
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        {icon ? <span className={toneAccent[tone]}>{icon}</span> : null}
      </div>
      <p className={cn('mt-2 text-3xl font-black tracking-tight', toneAccent[tone])}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
