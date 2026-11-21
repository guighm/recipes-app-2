import { Popover as BasePopover } from '@base-ui/react/popover';
import { useState, type ReactNode } from 'react';

interface PopoverProps {
  /** Popover trigger (clickable element). */
  children: ReactNode;
  /** Body — static, or a function that receives `close()` so the content can dismiss itself. */
  content: ReactNode | ((close: () => void) => ReactNode);
  title?: string;
}

/**
 * Floating panel anchored to the trigger (non-modal — the page keeps
 * scrolling). For text hints use `Tooltip`; for action menus, `Menu`.
 */
export function Popover({ children, content, title }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <BasePopover.Root open={open} onOpenChange={setOpen}>
      <BasePopover.Trigger render={children as never} />
      <BasePopover.Portal>
        <BasePopover.Positioner side="bottom" align="start" sideOffset={6} className="z-50">
          <BasePopover.Popup className="w-max max-w-80 rounded-lg border border-border bg-white p-4 text-[0.92rem] shadow-card-lifted outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            {title && <BasePopover.Title className="text-[1.05rem] font-semibold">{title}</BasePopover.Title>}
            {typeof content === 'function' ? content(close) : content}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}