import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ComponentProps, ReactNode } from 'react';

interface TooltipProps extends Omit<ComponentProps<typeof BaseTooltip.Positioner>, 'children'> {
  /** Text shown when hovering/focusing the trigger. */
  label: ReactNode;
  children: ReactNode;
}

/**
 * Floating hint over the child element. The trigger is `children` itself;
 * use `render={<Link … />}` on the child when it is a link.
 */
export function Tooltip({ label, children, side = 'top', ...props }: TooltipProps) {
  return (
    <BaseTooltip.Provider delay={300} closeDelay={150}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger render={children as never} />
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner side={side} sideOffset={6} {...props}>
            <BaseTooltip.Popup className="z-50 rounded-md border border-border bg-cobalt-ink px-2 py-1 text-[0.78rem] font-medium text-white shadow-card transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0">
              {label}
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
}