import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps): React.ReactElement {
  return <div className={cn('rounded-lg border border-slate-800 bg-slate-900/80 shadow-2xl shadow-slate-950/30', className)} {...props} />;
}

export function CardHeader({ className, ...props }: CardProps): React.ReactElement {
  return <div className={cn('border-b border-slate-800 p-4', className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps): React.ReactElement {
  return <div className={cn('p-4', className)} {...props} />;
}
