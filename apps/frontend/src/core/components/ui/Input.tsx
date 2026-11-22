import { Input as BaseInput } from '@base-ui/react/input';
import type { ComponentProps } from 'react';
import { cx } from './cx';

/**
 * Theme form-control style. Form controls have no styling in the `@layer base`
 * of `globals.css` (utilities win over base anyway) — this is the single source
 * of truth for the theme's text inputs.
 */
export const controlClasses =
  'w-full rounded-lg border border-border bg-porcelain px-[0.8rem] py-[0.65rem] text-ink outline-none placeholder:text-ink-faint focus:border-lapis focus:shadow-focus disabled:cursor-not-allowed disabled:opacity-45';

interface InputProps extends Omit<ComponentProps<typeof BaseInput>, 'className'> {
  className?: string;
}

export function Input({ className, ...props }: InputProps) {
  return <BaseInput className={cx(controlClasses, className)} {...props} />;
}