import { Toast } from '@base-ui/react/toast';
import type { ToastOptions, ToastType } from './Toaster';

/**
 * Fires toasts in the toast layer (`Toaster`) — use it in components that
 * live under the `<Toaster />` mounted in `App`.
 */
export function useToast(): {
  success: (options: ToastOptions) => void;
  error: (options: ToastOptions) => void;
  info: (options: ToastOptions) => void;
} {
  const { add } = Toast.useToastManager();

  const addToast = (type: ToastType, { title, description, timeout }: ToastOptions) => {
    add({
      type,
      title,
      description,
      timeout,
      priority: type === 'error' ? 'high' : 'low',
    });
  };

  return {
    success: (options) => addToast('success', options),
    error: (options) => addToast('error', options),
    info: (options) => addToast('info', options),
  };
}