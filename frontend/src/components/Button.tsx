import type { ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router';

export type ButtonVariant = 'primario' | 'quieto' | 'perigo';

const base =
  'inline-block cursor-pointer rounded-lg border text-center font-semibold no-underline transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45';

const variants: Record<ButtonVariant, string> = {
  primario: 'border-transparent bg-cobalto text-branco hover:bg-cobalto-tinta',
  quieto: 'border-borda bg-transparent text-tinta hover:border-cobalto hover:text-cobalto',
  perigo: 'border-borda bg-transparent text-tinta hover:border-erro hover:bg-erro-nevoa hover:text-erro',
};

const tamanho = 'px-[1.4rem] py-[0.7rem]';
const tamanhoCompacto = 'px-[0.9rem] py-[0.45rem] text-[0.85rem]';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  compact?: boolean;
}

export function Button({ variant = 'primario', compact = false, className = '', ...props }: ButtonProps) {
  const classes = [base, compact ? tamanhoCompacto : tamanho, variants[variant], className].join(' ');
  return <button className={classes} {...props} />;
}

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  compact?: boolean;
}

export function ButtonLink({ variant = 'primario', compact = false, className = '', ...props }: ButtonLinkProps) {
  const classes = [base, compact ? tamanhoCompacto : tamanho, variants[variant], className].join(' ');
  return <Link className={classes} {...props} />;
}