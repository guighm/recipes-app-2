import { Toast } from '@base-ui/react/toast';
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info';

/** Options for a toast — used by `useToast`. */
export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  /** Milliseconds until it dismisses itself. `0` keeps it until the user closes it. */
  timeout?: number;
}

interface ToasterProps {
  /** Default milliseconds until it dismisses itself (5000). */
  timeout?: number;
  /** Maximum number of toasts shown at once (3). */
  limit?: number;
  /** App content rendered inside the provider so `useToast()` works everywhere. */
  children?: ReactNode;
}

/**
 * Toast layer. Wrap the app with it (`<Toaster>…</Toaster>`) and fire
 * from any component with `useToast()`.
 */
export function Toaster({ timeout = 5000, limit = 3, children }: ToasterProps) {
  return (
    <Toast.Provider timeout={timeout} limit={limit}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed right-4 bottom-4 z-[60] flex w-[min(24rem,100vw-2rem)] flex-col gap-2 outline-none">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

const contentClasses =
  'pointer-events-auto rounded-xl border-[1.5px] bg-white p-[0.9rem] shadow-card-lifted transition-[opacity,transform,translate] duration-200 data-[ending-style]:opacity-0 data-[ending-style]:translate-y-2 data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0 data-[limited]:opacity-0 data-[type=error]:border-error data-[type=error]:bg-error-mist data-[type=success]:border-cobalt data-[type=info]:border-butter';

const titleClasses = 'font-display text-[1.02rem] leading-tight text-cobalt-ink';

const iconColors: Record<ToastType, string> = {
  success: 'border-cobalt text-cobalt',
  error: 'border-error bg-error-mist text-error',
  info: 'border-butter text-ink',
};

function ToastList() {
  const { toasts } = Toast.useToastManager();

  return toasts.map((toast) => {
    const type = (toast.type ?? 'info') as ToastType;
    return (
      <Toast.Root key={toast.id} toast={toast} className={contentClasses}>
        <Toast.Content className="flex items-start gap-2">
          <span
            aria-hidden="true"
            className={`mt-[0.3rem] grid size-[1.35rem] shrink-0 place-items-center rounded-md border-[1.5px] font-mono text-[0.8rem] font-medium ${iconColors[type]}`}
          >
            {type === 'error' ? '!' : '✓'}
          </span>
          <div className="flex-1">
            <Toast.Title className={titleClasses}>{toast.title}</Toast.Title>
            {toast.description && (
              <Toast.Description className="mt-1 text-[0.88rem] text-ink-soft">
                {toast.description}
              </Toast.Description>
            )}
          </div>
          <Toast.Close className="cursor-pointer rounded-md px-1.5 py-0.5 text-[0.78rem] font-semibold text-ink-soft hover:text-ink">
            Close
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    );
  });
}