import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ReactNode } from 'react';
import { cx } from './cx';

/** Darkened backdrop behind the modal — shared with the AlertDialog. */
export const backdropClasses =
  'fixed inset-0 z-50 bg-ink/45 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0';

/** Modal box — shared with the AlertDialog. Width is set by the caller. */
export const popupClasses =
  'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-white p-6 shadow-card-lifted transition-[opacity,transform] duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Dialog body — e.g. a `<form>`. */
  children: ReactNode;
  /** Action bar (bottom-right corner). Omitted = no footer. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Generic modal (focus trapped, closes with Esc and backdrop click) for
 * forms and one-off actions. For confirmation requests use `ConfirmDialog`;
 * for lightweight floating content, `Popover`.
 */
export function Dialog({ open, onOpenChange, title, description, children, footer, className }: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={backdropClasses} />
        <BaseDialog.Popup className={cx('w-[min(30rem,100%-2rem)]', popupClasses, className)}>
          <BaseDialog.Title className="text-[1.3rem]">{title}</BaseDialog.Title>
          {description && (
            <BaseDialog.Description className="mt-2 text-[0.95rem] text-ink-soft">{description}</BaseDialog.Description>
          )}
          <div className="mt-5">{children}</div>
          {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}