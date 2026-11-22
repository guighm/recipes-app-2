import { Menu as BaseMenu } from '@base-ui/react/menu';
import { useTheme, type ThemeMode } from '@/core/theme/store';
import { Check, Moon, Monitor, Sun } from 'lucide-react';

const MODE_OPTIONS: readonly { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

const triggerClasses =
  'inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-ink outline-none transition-colors duration-200 hover:text-lapis data-[popup-open]:text-lapis';

const itemClasses =
  'flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-[0.45rem] text-[0.92rem] outline-none data-[highlighted]:bg-cobalt-mist';

/**
 * Dropdown de seleção de tema. Um `RadioGroup` do base-ui dá aos itens a
 * semântica de `menuitemradio` (valor único + estado marcado), com
 * navegação por teclado e gestão de foco nativas do Menu.
 */
export default function ModeToggle() {
  const { mode, setMode } = useTheme();
  const TriggerIcon = MODE_OPTIONS.find((option) => option.value === mode)?.icon ?? Monitor;

  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger
        aria-label="Select theme"
        render={
          <button type="button" className={triggerClasses}>
            <TriggerIcon aria-hidden="true" size={18} />
          </button>
        }
      />
      <BaseMenu.Portal>
        <BaseMenu.Positioner align="end" sideOffset={6} className="z-50">
          <BaseMenu.Popup className="flex flex-col items-start rounded-lg border border-border bg-surface p-1 shadow-card-lifted outline-none transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0">
            <BaseMenu.RadioGroup value={mode} onValueChange={(value) => setMode(value as ThemeMode)}>
              {MODE_OPTIONS.map(({ value, label, icon: OptionIcon }) => (
                <BaseMenu.RadioItem key={value} value={value} className={itemClasses}>
                  <span aria-hidden="true" className="flex w-4 justify-center">
                    <BaseMenu.RadioItemIndicator>
                      <Check className="text-lapis" size={14} strokeWidth={2.5} />
                    </BaseMenu.RadioItemIndicator>
                  </span>
                  <OptionIcon aria-hidden="true" size={16} />
                  {label}
                </BaseMenu.RadioItem>
              ))}
            </BaseMenu.RadioGroup>
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
