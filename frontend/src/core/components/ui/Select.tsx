import type { SelectRootChangeEventDetails } from '@base-ui/react/select';
import { Select as BaseSelect } from '@base-ui/react/select';
import { useId } from 'react';
import Asterisk from '../Asterisk';
import { Field, errorClasses, labelClasses } from './Field';
import { cx } from './cx';

export interface SelectOption {
  value: string;
  label: string;
}

const triggerClasses =
  'flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-porcelain px-[0.8rem] py-[0.65rem] text-left text-[1rem] text-ink outline-none hover:border-cobalt focus-visible:border-cobalt focus-visible:shadow-[0_0_0_3px_var(--color-cobalt-mist)] disabled:cursor-not-allowed disabled:opacity-45 data-[invalid]:border-error data-[popup-open]:border-cobalt data-[popup-open]:shadow-[0_0_0_3px_var(--color-cobalt-mist)]';

const chevronClasses =
  'size-4 shrink-0 fill-none stroke-ink-soft stroke-[1.8] transition-transform duration-200 [[data-popup-open]_&]:rotate-180';

const popupClasses =
  'max-h-72 min-w-(--anchor-width) overflow-auto rounded-lg border border-border bg-white p-1 shadow-card-lifted outline-none';

const itemClasses =
  'flex cursor-pointer items-center gap-2 rounded-md px-2 py-[0.45rem] text-[0.92rem] outline-none data-[highlighted]:bg-cobalt-mist data-[selected]:font-semibold data-[selected]:text-cobalt';

interface SelectFieldProps {
  label: string;
  items: readonly SelectOption[];
  value: string | null;
  /** `value` never reaches null — the selection is always one of `items`. */
  onValueChange: (value: string, eventDetails: SelectRootChangeEventDetails) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Complete select field (label + trigger + list + error) meant to be used
 * controlled — with react-hook-form, via `Controller`.
 */
export function SelectField({
  label,
  items,
  value,
  onValueChange,
  error,
  required = false,
  placeholder,
  disabled,
  className,
}: SelectFieldProps) {
  const generatedId = useId();

  return (
    <Field.Root invalid={Boolean(error)} disabled={disabled} className={cx('flex flex-col items-stretch gap-1.5', className)}>
      <Field.Label htmlFor={generatedId} className={labelClasses}>
        {label} {required && <Asterisk />}
      </Field.Label>
      <BaseSelect.Root
        items={items}
        value={value}
        onValueChange={(value, eventDetails) => {
          if (value !== null) {
            onValueChange(value, eventDetails);
          }
        }}
        required={required}
        disabled={disabled}
      >
        <BaseSelect.Trigger id={generatedId} nativeButton={false} className={triggerClasses}>
          <BaseSelect.Value placeholder={placeholder ?? 'Select…'} />
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className={chevronClasses}
          >
            <path d="m4 6 4 4 4-4" />
          </svg>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner align="start" sideOffset={6} className="z-50">
            <BaseSelect.Popup className={popupClasses}>
              <BaseSelect.List>
                {items.map((option) => (
                  <BaseSelect.Item key={option.value} value={option.value} className={itemClasses}>
                    <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator className="ml-auto text-cobalt">✓</BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
      {error && <Field.Error match={true} className={errorClasses}>{error}</Field.Error>}
    </Field.Root>
  );
}