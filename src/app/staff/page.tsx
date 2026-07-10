/**
 * @module app/staff/page
 *
 * Staff operations landing page. Wraps the StaffDashboard command center
 * component with navigation back to role selection. Serves as the entry
 * point for the staff persona journey.
 */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { StaffDashboard } from '@/components/staff/StaffDashboard';
import { Button } from '@/components/ui/button';

/** Staff command center page with back navigation and dashboard. */
export default function StaffPage(): React.ReactElement {
  return (
    <main className="min-h-screen px-5 py-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button asChild aria-label="Return to PACE role selection" variant="ghost">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </Link>
        </Button>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-300">P.A.C.E. Operations Center</p>
      </div>
      <StaffDashboard />
    </main>
  );
}
