import { Button as BaseButton } from '@base-ui/react/button';
import type { ComponentProps } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cx } from './cx';

export type ButtonVariant = 'primary' | 'quiet' | 'danger';

const base =
  'inline-block cursor-pointer rounded-lg border text-center font-semibold no-underline transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45';

const variants: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-cobalt text-white hover:bg-cobalt-ink',
  quiet: 'border-border bg-transparent text-ink hover:border-cobalt hover:text-cobalt',
  danger: 'border-border bg-transparent text-ink hover:border-error hover:bg-error-mist hover:text-error',
};

const sizeClasses = 'px-[1.4rem] py-[0.7rem]';
const compactSizeClasses = 'px-[0.9rem] py-[0.45rem] text-[0.85rem]';

function classes(variant: ButtonVariant, compact: boolean, className?: string) {
  return cx(base, compact ? compactSizeClasses : sizeClasses, variants[variant], className);
}

interface ButtonProps extends Omit<ComponentProps<typeof BaseButton>, 'className'> {
  variant?: ButtonVariant;
  compact?: boolean;
  className?: string;
}

export function Button({ variant = 'primary', compact = false, className, ...props }: ButtonProps) {
  return <BaseButton className={classes(variant, compact, className)} {...props} />;
}

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  compact?: boolean;
  className?: string;
}

export function ButtonLink({ variant = 'primary', compact = false, className, ...props }: ButtonLinkProps) {
  return (
    <BaseButton
      nativeButton={false}
      render={<Link {...props} />}
      className={classes(variant, compact, className)}
    />
  );
}