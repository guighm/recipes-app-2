import { Field } from '@base-ui/react/field';
import { Switch } from '@base-ui/react/switch';
import Asterisk from '../Asterisk';
import { errorClasses } from './Field';
import { cx } from './cx';

interface SwitchFieldProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/**
 * On/off switch field over the Base UI Switch. The switch lives inside
 * the label — clicking anywhere on the row toggles the value.
 *
 * Does not accept react-hook-form `registration` (the Switch doesn't use
 * `onChange`); use it controlled via `Controller`, or `defaultChecked` for
 * the simple cases.
 */
export function SwitchField({
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  error,
  required = false,
  disabled,
  name,
  className,
}: SwitchFieldProps) {
  return (
    <Field.Root invalid={Boolean(error)} disabled={disabled} name={name} className={cx('flex flex-col gap-1', className)}>
      <Field.Label className="flex cursor-pointer items-center gap-2 text-[0.95rem] text-ink">
        <Switch.Root
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          required={required}
          className="flex h-[1.35rem] w-[2.4rem] shrink-0 items-center rounded-full border-[1.5px] border-border bg-porcelain p-[0.15rem] outline-none transition-colors duration-150 focus-visible:border-cobalt focus-visible:shadow-[0_0_0_3px_var(--color-cobalt-mist)] data-[checked]:border-cobalt data-[checked]:bg-cobalt disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Switch.Thumb className="size-[1rem] rounded-full bg-white shadow-card transition-transform duration-150 data-[checked]:translate-x-[1rem]" />
        </Switch.Root>
        <span>
          {label} {required && <Asterisk />}
        </span>
      </Field.Label>
      {error && <Field.Error match={true} className={errorClasses}>{error}</Field.Error>}
    </Field.Root>
  );
}