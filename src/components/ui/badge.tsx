/**
 * @module components/ui/badge
 *
 * Pill-shaped status badge with five tone variants (neutral, good, warn,
 * critical, accent). Used in the heatmap, alert feed, and KPI cards to
 * communicate severity at a glance.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Available color tones for the Badge component. */
export type BadgeTone = 'neutral' | 'good' | 'warn' | 'critical' | 'accent';

/** CSS class map for each badge tone. */
const tones: Readonly<Record<BadgeTone, string>> = {
  neutral: 'bg-slate-500/15 text-slate-300 ring-slate-400/20',
  good: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/25',
  warn: 'bg-amber-500/15 text-amber-300 ring-amber-400/25',
  critical: 'bg-red-500/15 text-red-300 ring-red-400/30',
  accent: 'bg-cyan-500/15 text-cyan-300 ring-cyan-400/25'
};

/** Props for the Badge component, extending native span attributes. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual tone controlling the badge color scheme. */
  readonly tone?: BadgeTone;
}

/** Pill-shaped status badge with color-coded severity tone. */
export function Badge({ tone = 'neutral', className, ...props }: BadgeProps): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset',
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
