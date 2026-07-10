/**
 * @module components/ui/stat-card
 *
 * KPI stat card with a tone-colored accent bar, icon, value, and hint text.
 * Used by the KpiBar to display attendance, density, alerts, and
 * sustainability metrics in the staff dashboard.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { KpiTone } from '@/types';

/** Accent text color map for each KPI tone. */
const toneAccent: Readonly<Record<KpiTone, string>> = {
  neutral: 'text-cyan-300',
  good: 'text-emerald-300',
  warn: 'text-amber-300',
  critical: 'text-red-300'
};

/** Left-edge bar color map for each KPI tone. */
const toneBar: Readonly<Record<KpiTone, string>> = {
  neutral: 'bg-cyan-400',
  good: 'bg-emerald-400',
  warn: 'bg-amber-400',
  critical: 'bg-red-400'
};

/** Props for the StatCard component. */
export interface StatCardProps {
  readonly label: string;
  readonly value: string;
  readonly hint: string;
  readonly tone?: KpiTone;
  readonly icon?: React.ReactNode;
}

/** Single KPI stat card with colored accent bar and optional icon. */
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
