import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import { Button } from './Button';
import { backdropClasses, popupClasses } from './Dialog';
import { cx } from './cx';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive variant — uses the `danger` button. */
  destructive?: boolean;
  /** Operation in flight: disables the buttons and swaps the label. */
  pending?: boolean;
  pendingLabel?: string;
}

/**
 * Confirmation dialog (modal, focus trapped, closes with Esc) to replace
 * `window.confirm` in destructive actions. Confirm calls `onConfirm` and
 * keeps the dialog open — the caller decides when to close it (e.g. in the
 * mutation's `onSuccess`, so the `pending` state remains visible).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  pending = false,
  pendingLabel = 'Working…',
}: ConfirmDialogProps) {
  return (
    <BaseAlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseAlertDialog.Portal>
        <BaseAlertDialog.Backdrop className={backdropClasses} />
        <BaseAlertDialog.Popup className={cx(popupClasses, 'w-[min(26rem,100%-2rem)]')}>
          <BaseAlertDialog.Title className="text-[1.3rem]">{title}</BaseAlertDialog.Title>
          {description && (
            <BaseAlertDialog.Description className="mt-2 text-[0.95rem] text-ink-soft">
              {description}
            </BaseAlertDialog.Description>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <BaseAlertDialog.Close render={<Button variant="quiet" compact />} disabled={pending}>
              {cancelLabel}
            </BaseAlertDialog.Close>
            <Button
              variant={destructive ? 'danger' : 'primary'}
              compact
              disabled={pending}
              onClick={onConfirm}
            >
              {pending ? pendingLabel : confirmLabel}
            </Button>
          </div>
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Portal>
    </BaseAlertDialog.Root>
  );
}