import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
  secondary: 'bg-slate-800 text-slate-50 hover:bg-slate-700',
  danger: 'bg-red-500 text-white hover:bg-red-400',
  ghost: 'bg-transparent text-slate-200 hover:bg-slate-800'
};

export function Button({ asChild = false, className, variant = 'primary', ...props }: ButtonProps): React.ReactElement {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
