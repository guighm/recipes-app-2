import { Field } from '@base-ui/react/field';
import { useId, type ComponentProps } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import Asterisk from '../Asterisk';
import { Input } from './Input';
import { cx } from './cx';

export { Field };

export const errorClasses =
  'rounded-lg bg-error-mist px-[0.8rem] py-[0.6rem] text-[0.85rem] font-medium text-error';

export const labelClasses = 'label text-[0.72rem] font-medium text-ink-soft';

interface TextFieldProps extends ComponentProps<'input'> {
  label: string;
  /** Return of react-hook-form's `register('field')` — the form stays uncontrolled. */
  registration?: UseFormRegisterReturn;
  /** react-hook-form validation message (e.g. `errors.email?.message`). */
  error?: string;
  required?: boolean;
}

/**
 * Complete form field: label + input + error message, over the Base UI
 * Field (`data-invalid`, `aria-invalid` and automatic label association).
 */
export function TextField({ label, registration, error, required = false, className, id, ...input }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <Field.Root invalid={Boolean(error)} className={cx('flex flex-col items-stretch gap-1.5', className)}>
      <Field.Label htmlFor={fieldId} className={labelClasses}>
        {label} {required && <Asterisk />}
      </Field.Label>
      <Input id={fieldId} {...registration} {...input} />
      {error && <Field.Error match={true} className={errorClasses}>{error}</Field.Error>}
    </Field.Root>
  );
}