'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps
  extends Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, 'checked'> {
  checked?: boolean | 'indeterminate';
  indeterminate?: boolean;
}

function Checkbox({ className, checked, indeterminate, ...props }: CheckboxProps) {
  const resolvedChecked = indeterminate ? 'indeterminate' : checked;

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer size-4 shrink-0 rounded-sm border border-primary bg-background shadow-sm ring-offset-background transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
        className
      )}
      checked={resolvedChecked}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {resolvedChecked === 'indeterminate' ? (
          <MinusIcon className="size-3.5" />
        ) : (
          <CheckIcon className="size-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

Checkbox.displayName = 'Checkbox';

export { Checkbox };
