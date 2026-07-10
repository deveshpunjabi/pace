import { AlertTriangle, Gauge, Leaf, Users } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import type { VenueKpi } from '@/types';

const icons: Record<string, React.ReactNode> = {
  attendance: <Users className="h-4 w-4" aria-hidden="true" />,
  density: <Gauge className="h-4 w-4" aria-hidden="true" />,
  alerts: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
  sustainability: <Leaf className="h-4 w-4" aria-hidden="true" />
};

export interface KpiBarProps {
  kpis: VenueKpi[];
}

export function KpiBar({ kpis }: KpiBarProps): React.ReactElement {
  return (
    <section aria-label="Venue key performance indicators" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <StatCard
          hint={kpi.hint}
          icon={icons[kpi.id]}
          key={kpi.id}
          label={kpi.label}
          tone={kpi.tone}
          value={kpi.value}
        />
      ))}
    </section>
  );
}
