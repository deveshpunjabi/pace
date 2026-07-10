/**
 * @module components/ui/card
 *
 * Glass-morphism card primitives (Card, CardHeader, CardContent) used as the
 * primary layout container across the staff and fan interfaces.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Props for card layout components, extending native div attributes. */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Glass-morphism container card with rounded corners and shadow. */
export function Card({ className, ...props }: CardProps): React.ReactElement {
  return <div className={cn('glass rounded-2xl shadow-2xl shadow-slate-950/40', className)} {...props} />;
}

/** Card header section with a bottom border separator. */
export function CardHeader({ className, ...props }: CardProps): React.ReactElement {
  return <div className={cn('border-b border-white/10 p-4', className)} {...props} />;
}

/** Card content area with standard padding. */
export function CardContent({ className, ...props }: CardProps): React.ReactElement {
  return <div className={cn('p-4', className)} {...props} />;
}
