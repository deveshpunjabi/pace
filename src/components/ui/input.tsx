/**
 * @module components/ui/input
 *
 * Styled text input with dark theme, focus ring, and full HTML input API
 * pass-through. Used for chat message entry across fan and staff interfaces.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Props for the Input component, extending native input attributes. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/** Dark-themed text input with accessible focus styling. */
export function Input({ className, ...props }: InputProps): React.ReactElement {
  return (
    <input
      className={cn(
        'min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/30',
        className
      )}
      {...props}
    />
  );
}
