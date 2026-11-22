import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { LucideIcon } from 'lucide-react';
import { Fragment, type ReactElement, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Button, type ButtonVariant } from './Button';

export interface MenuItemOption {
  label: string;
  /** Optional icon (lucide-react) rendered before the label. */
  icon?: LucideIcon;
  /** Item action (mutually exclusive with `href`). */
  onSelect?: () => void;
  /** Internal navigation — renders a react-router `Link`. */
  href?: string;
  /** Destructive item, in `error`. */
  destructive?: boolean;
  disabled?: boolean;
  /** Renders a separator before this item. */
  separatorBefore?: boolean;
}

interface MenuProps {
  /** Trigger label (a `Button`). Obrigatório quando não há `trigger` customizado. */
  label?: ReactNode;
  /** Trigger customizado (ex.: avatar) no lugar do `Button` com `label`. */
  trigger?: ReactElement;
  items: readonly MenuItemOption[];
  variant?: ButtonVariant;
  align?: 'start' | 'center' | 'end';
}

const itemClasses =
  'flex cursor-pointer items-center gap-2 rounded-md px-2 py-[0.45rem] text-[0.92rem] outline-none data-[highlighted]:bg-cobalt-mist data-[disabled]:opacity-45';

/**
 * Dropdown action menu. Items with `href` navigate (`LinkItem` +
 * react-router); the rest run `onSelect` and close the menu.
 */
export function Menu({ label, trigger, items, variant = 'quiet', align = 'end' }: MenuProps) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger render={trigger ?? <Button variant={variant}>{label}</Button>} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner align={align} sideOffset={6} className="z-50">
          <BaseMenu.Popup className="min-w-44 rounded-lg border border-border bg-surface p-1 shadow-card-lifted outline-none transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0">
            {items.map((option) => (
              <Fragment key={option.label}>
                {option.separatorBefore && <BaseMenu.Separator className="mx-1 my-1 border-t border-border" />}
                {option.href ? (
                  <BaseMenu.LinkItem
                    render={<Link to={option.href} />}
                    closeOnClick
                    className={`${itemClasses} ${option.destructive ? 'text-error' : ''}`}
                  >
                    <OptionIcon option={option} />
                    {option.label}
                  </BaseMenu.LinkItem>
                ) : (
                  <BaseMenu.Item
                    onClick={option.onSelect}
                    disabled={option.disabled}
                    className={`${itemClasses} ${option.destructive ? 'text-error' : ''}`}
                  >
                    <OptionIcon option={option} />
                    {option.label}
                  </BaseMenu.Item>
                )}
              </Fragment>
            ))}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

/** Ícone do item, no padrão do ModeToggle (16px, decorativo). */
function OptionIcon({ option }: { option: MenuItemOption }) {
  const Icon = option.icon;
  return Icon !== undefined ? <Icon aria-hidden="true" size={16} /> : null;
}
