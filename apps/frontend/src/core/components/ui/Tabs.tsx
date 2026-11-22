import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type {
  TabsRootProps,
  TabsListProps,
  TabsTabProps,
  TabsPanelProps,
} from '@base-ui/react/tabs';
import { cx } from './cx';

/**
 * Abas estilo segmented control sobre o Tabs do @base-ui/react: track em
 * `porcelain` dentro do card, pill `cobalt-mist` que desliza (Tabs.Indicator)
 * entre as abas conforme a seleção. O texto da aba fica sobre a pill via
 * `relative z-1` — nunca remova essas classes do Tab.
 *
 * O `value` do Root deve casar com o `value` de cada Tab/Panel; use o Root
 * controlado quando a aba ativa depender de estado externo (ex.: rota).
 */

const listClasses =
  'relative flex gap-1 rounded-lg border border-border bg-porcelain p-1';

const tabClasses =
  'relative z-1 flex-1 cursor-pointer rounded-md px-3 py-[0.55rem] text-center text-[0.95rem] outline-none text-ink-soft hover:text-ink focus-visible:shadow-focus data-[active]:font-semibold data-[active]:text-lapis';

const indicatorClasses =
  'absolute top-1 bottom-1 left-0 z-0 w-(--active-tab-width) translate-x-(--active-tab-left) rounded-md bg-cobalt-mist transition-[translate,width] duration-200 ease-out';

const panelClasses = 'outline-none';

type StyledRootProps = TabsRootProps & { className?: string };
type StyledListProps = TabsListProps & { className?: string };
type StyledTabProps = TabsTabProps & { className?: string };
type StyledPanelProps = TabsPanelProps & { className?: string };

export function TabsRoot({ className, ...props }: StyledRootProps) {
  return <BaseTabs.Root className={cx(className)} {...props} />;
}

/** List sempre renderiza o Indicator (a pill que desliza). */
export function TabsList({ className, children, ...props }: StyledListProps) {
  return (
    <BaseTabs.List className={cx(listClasses, className)} {...props}>
      {children}
      <BaseTabs.Indicator className={indicatorClasses} />
    </BaseTabs.List>
  );
}

export function TabsTab({ className, ...props }: StyledTabProps) {
  return <BaseTabs.Tab className={cx(tabClasses, className)} {...props} />;
}

export function TabsPanel({ className, ...props }: StyledPanelProps) {
  return <BaseTabs.Panel className={cx(panelClasses, className)} {...props} />;
}
