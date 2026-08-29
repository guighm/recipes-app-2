import { Input as BaseInput } from '@base-ui/react/input';
import type { ComponentProps } from 'react';
import { cx } from './cx';

/**
 * Theme form-control style — used to live in the `@layer base` of index.css
 * and now lives in the component.
 */
export const controlClasses =
  'w-full rounded-lg border border-border bg-porcelain px-[0.8rem] py-[0.65rem] text-ink outline-none placeholder:text-[#A6AAB6] focus:border-cobalt focus:shadow-[0_0_0_3px_var(--color-cobalt-mist)] disabled:cursor-not-allowed disabled:opacity-45';

interface InputProps extends Omit<ComponentProps<typeof BaseInput>, 'className'> {
  className?: string;
}

export function Input({ className, ...props }: InputProps) {
  return <BaseInput className={cx(controlClasses, className)} {...props} />;
}