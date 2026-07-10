import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-[0_8px_24px_-10px_rgba(34,211,238,0.7)] hover:from-cyan-300 hover:to-emerald-300',
  secondary: 'glass text-slate-100 hover:border-cyan-400/40 hover:text-white',
  danger:
    'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-[0_8px_24px_-10px_rgba(244,63,94,0.7)] hover:from-red-400 hover:to-rose-400',
  ghost: 'bg-transparent text-slate-300 hover:bg-white/5 hover:text-white'
};

export function Button({ asChild = false, className, variant = 'primary', ...props }: ButtonProps): React.ReactElement {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
