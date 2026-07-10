/**
 * @module components/ui/quick-action
 *
 * Pill-shaped quick-action chip button used for pre-composed prompts in the
 * fan concierge and staff copilot. Supports an optional icon and adapts to
 * the glass-morphism design system.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Props for the QuickAction component, extending native button attributes. */
export interface QuickActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional icon element displayed before the label. */
  readonly icon?: React.ReactNode;
  /** Visible text label for the chip. */
  readonly label: string;
}

/** Pill-shaped chip button for quick-action prompts with optional icon. */
export function QuickAction({ icon, label, className, ...props }: QuickActionProps): React.ReactElement {
  return (
    <button
      type="button"
      className={cn(
        'glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:text-white hover:shadow-[0_0_20px_-6px_rgba(34,211,238,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {icon ? (
        <span className="text-cyan-300" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {label}
    </button>
  );
}
