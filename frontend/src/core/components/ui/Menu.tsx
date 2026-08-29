import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Button, type ButtonVariant } from './Button';

export interface MenuItemOption {
  label: string;
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
  /** Trigger label (a `Button`). */
  label: ReactNode;
  items: readonly MenuItemOption[];
  variant?: ButtonVariant;
  align?: 'start' | 'center' | 'end';
}

const itemClasses =
  'flex cursor-pointer items-center rounded-md px-2 py-[0.45rem] text-[0.92rem] outline-none data-[highlighted]:bg-cobalt-mist data-[disabled]:opacity-45';

/**
 * Dropdown action menu. Items with `href` navigate (`LinkItem` +
 * react-router); the rest run `onSelect` and close the menu.
 */
export function Menu({ label, items, variant = 'quiet', align = 'end' }: MenuProps) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger render={<Button variant={variant}>{label}</Button>} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner align={align} sideOffset={6} className="z-50">
          <BaseMenu.Popup className="min-w-44 rounded-lg border border-border bg-white p-1 shadow-card-lifted outline-none transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0">
            {items.map((option) => (
              <Fragment key={option.label}>
                {option.separatorBefore && <BaseMenu.Separator className="mx-1 my-1 border-t border-border" />}
                {option.href ? (
                  <BaseMenu.LinkItem
                    render={<Link to={option.href} />}
                    closeOnClick
                    className={`${itemClasses} ${option.destructive ? 'text-error' : ''}`}
                  >
                    {option.label}
                  </BaseMenu.LinkItem>
                ) : (
                  <BaseMenu.Item
                    onClick={option.onSelect}
                    disabled={option.disabled}
                    className={`${itemClasses} ${option.destructive ? 'text-error' : ''}`}
                  >
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