/**
 * @module components/ui/scroll-area
 *
 * Styled scroll area built on Radix ScrollArea primitives. Provides a custom
 * scrollbar that matches the dark theme while maintaining keyboard and
 * assistive technology accessibility.
 */

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as React from 'react';
import { cn } from '@/lib/utils';

/** Props for the ScrollArea component, extending Radix Root props. */
export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {}

/** Dark-themed scroll area with custom vertical scrollbar. */
export function ScrollArea({ className, children, ...props }: ScrollAreaProps): React.ReactElement {
  return (
    <ScrollAreaPrimitive.Root className={cn('overflow-hidden', className)} {...props}>
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar className="flex touch-none select-none bg-slate-800 p-0.5" orientation="vertical">
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-slate-600" />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}
