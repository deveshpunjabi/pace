import type { OpsAlert } from '@/types';

export interface AlertFeedProps {
  alerts: OpsAlert[];
}

export function AlertFeed({ alerts }: AlertFeedProps): React.ReactElement {
  return (
    <section aria-labelledby="alerts-heading" className="grid gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">AI Alert Feed</p>
        <h2 id="alerts-heading" className="text-xl font-black text-white">Operational Alerts</h2>
      </div>
      <div className="grid gap-3" role="feed">
        {alerts.map((alert) => (
          <article className="rounded-lg border border-slate-700 bg-slate-950 p-3" key={alert.id}>
            <div className="flex items-center justify-between gap-2">
              <strong className="text-sm text-white">{alert.sector}</strong>
              <span className={alert.severity === 'high' ? 'text-xs font-black uppercase text-red-300' : 'text-xs font-black uppercase text-yellow-300'}>
                {alert.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{alert.message}</p>
            <p className="mt-2 text-sm font-semibold text-cyan-200">{alert.aiAction}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
