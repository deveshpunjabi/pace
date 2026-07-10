/**
 * @module components/staff/KpiBar
 *
 * Venue-wide KPI display bar for the staff command center. Renders four
 * StatCards (attendance, density, alerts, sustainability) with severity-
 * appropriate color tones, providing at-a-glance situational awareness.
 */

import { AlertTriangle, Gauge, Leaf, Users } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import type { VenueKpi } from '@/types';

/** Icon mapping for each KPI by its identifier. */
const icons: Readonly<Record<string, React.ReactNode>> = {
  attendance: <Users className="h-4 w-4" aria-hidden="true" />,
  density: <Gauge className="h-4 w-4" aria-hidden="true" />,
  alerts: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
  sustainability: <Leaf className="h-4 w-4" aria-hidden="true" />
};

/** Props for the KpiBar component. */
export interface KpiBarProps {
  readonly kpis: VenueKpi[];
}

/** Renders venue-wide KPIs in a responsive grid of stat cards. */
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
