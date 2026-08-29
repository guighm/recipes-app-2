import { Checkbox } from '@base-ui/react/checkbox';
import { Field } from '@base-ui/react/field';
import Asterisk from '../Asterisk';
import { errorClasses } from './Field';
import { cx } from './cx';

interface CheckboxFieldProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  error?: string;
  /** Supporting text shown below the control. */
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/**
 * Checkbox field over the Base UI Checkbox. The box lives inside the
 * label — clicking anywhere on the row toggles the value.
 *
 * Does not accept react-hook-form `registration` (the Checkbox doesn't use
 * `onChange`); use it controlled via `Controller`, or `defaultChecked` for
 * the simple cases.
 */
export function CheckboxField({
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  error,
  hint,
  required = false,
  disabled,
  name,
  className,
}: CheckboxFieldProps) {
  return (
    <Field.Root invalid={Boolean(error)} disabled={disabled} name={name} className={cx('flex flex-col gap-1', className)}>
      <Field.Label className="flex cursor-pointer items-center gap-2 text-[0.95rem] text-ink">
        <Checkbox.Root
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          required={required}
          className="grid size-[1.15rem] shrink-0 place-items-center rounded-md border-[1.5px] border-border bg-porcelain outline-none transition-colors duration-150 focus-visible:border-cobalt focus-visible:shadow-[0_0_0_3px_var(--color-cobalt-mist)] data-[checked]:border-cobalt data-[checked]:bg-cobalt disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Checkbox.Indicator className="text-white data-[unchecked]:hidden">
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3 fill-none stroke-white stroke-2">
              <path d="m3 8.5 3.5 3.5L13 4.5" />
            </svg>
          </Checkbox.Indicator>
        </Checkbox.Root>
        <span>
          {label} {required && <Asterisk />}
        </span>
      </Field.Label>
      {hint && <p className="pl-[1.95rem] text-[0.8rem] text-ink-soft">{hint}</p>}
      {error && (
        <Field.Error match={true} className={`${errorClasses} ml-[1.95rem]`}>
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
}