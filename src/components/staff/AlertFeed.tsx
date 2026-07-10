'use client';

import { Play, ShieldAlert, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { OpsAlert } from '@/types';

export interface AlertFeedProps {
  alerts: OpsAlert[];
  onExecute: (alert: OpsAlert) => void;
  executedIds: string[];
}

export function AlertFeed({ alerts, onExecute, executedIds }: AlertFeedProps): React.ReactElement {
  return (
    <section aria-labelledby="alerts-heading" className="grid gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-300">AI Alert Queue</p>
          <h2 id="alerts-heading" className="text-xl font-black text-white">
            Prioritized Actions
          </h2>
        </div>
        <Badge tone="critical">{alerts.filter((alert) => alert.severity === 'high').length} high</Badge>
      </div>

      {alerts.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
          All sectors nominal. No mitigation required.
        </p>
      ) : (
        <ul className="grid gap-3" role="feed">
          {alerts.map((alert) => {
            const executed = executedIds.includes(alert.id);

            return (
              <li className="rounded-xl border border-white/10 bg-slate-950/50 p-3" key={alert.id}>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                    {alert.severity === 'high' ? (
                      <ShieldAlert className="h-4 w-4 text-red-300" aria-hidden="true" />
                    ) : (
                      <Leaf className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    )}
                    {alert.sector}
                  </span>
                  <Badge tone={alert.severity === 'high' ? 'critical' : 'warn'}>{alert.severity}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-300">{alert.message}</p>
                <p className="mt-1 text-sm font-semibold text-cyan-200">{alert.aiAction}</p>
                <Button
                  aria-label={`Execute AI action for ${alert.sector}`}
                  className="mt-3 w-full"
                  disabled={executed}
                  onClick={() => onExecute(alert)}
                  variant={alert.severity === 'high' ? 'danger' : 'secondary'}
                >
                  {executed ? (
                    'Dispatched ✓'
                  ) : (
                    <>
                      <Play className="h-4 w-4" aria-hidden="true" /> Execute action
                    </>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
