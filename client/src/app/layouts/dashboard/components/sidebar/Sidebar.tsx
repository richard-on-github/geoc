import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/shared/lib'
import { useSidebarStore } from '@/app/stores'
import { navigationConfig, navigationBottomConfig, env } from '@/app/config'
import { useCan } from '@/shared/hooks/useCan'
import { SidebarNavItem } from './SidebarNavItem'
import type { NavItem } from '@/app/config'

function filterNavItems(items: NavItem[], can: (p: string) => boolean): NavItem[] {
  return items.reduce<NavItem[]>((acc, item) => {
    if (item.permission !== undefined && !can(item.permission)) return acc
    if (item.children !== undefined) {
      const visibleChildren = item.children.filter(
        (child) => child.permission === undefined || can(child.permission),
      )
      if (visibleChildren.length === 0) return acc
      return [...acc, { ...item, children: visibleChildren }]
    }
    return [...acc, item]
  }, [])
}

export function Sidebar() {
  const { isCollapsed, toggle } = useSidebarStore()
  const { can } = useCan()

  const visibleNav = filterNavItems(navigationConfig, can)
  const visibleBottom = filterNavItems(navigationBottomConfig, can)

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]',
        'transition-all duration-200 ease-in-out',
        isCollapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-width)]',
      )}
      aria-label="Navigation principale"
    >
      <div
        className={cn(
          'flex h-[var(--topbar-height)] items-center border-b border-[hsl(var(--sidebar-border))]',
          isCollapsed ? 'justify-center px-0' : 'justify-between px-4',
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-primary))]">
              <span className="text-sm font-bold text-white">G</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-tight">GEOC</p>
              <p className="text-[10px] opacity-50 truncate">LONATO Togo</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-primary))]">
            <span className="text-sm font-bold text-white">G</span>
          </div>
        )}
        {!isCollapsed && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Réduire la navigation"
            className="ml-2 rounded-md p-1.5 text-[hsl(var(--sidebar-foreground))] opacity-50 hover:opacity-100 hover:bg-[hsl(var(--sidebar-accent))] transition-colors"
          >
            <PanelLeftClose size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" aria-label="Menu principal">
        {isCollapsed && (
          <div className="flex justify-center py-1">
            <button
              type="button"
              onClick={toggle}
              aria-label="Déplier la navigation"
              className="rounded-md p-1.5 text-[hsl(var(--sidebar-foreground))] opacity-50 hover:opacity-100 hover:bg-[hsl(var(--sidebar-accent))] transition-colors"
            >
              <PanelLeftOpen size={16} aria-hidden="true" />
            </button>
          </div>
        )}
        {visibleNav.map((item) => (
          <SidebarNavItem key={item.id} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      <div className="border-t border-[hsl(var(--sidebar-border))] p-2 space-y-0.5">
        {visibleBottom.map((item) => (
          <SidebarNavItem key={item.id} item={item} isCollapsed={isCollapsed} />
        ))}
        {!isCollapsed && (
          <p className="px-3 py-1 text-[10px] text-[hsl(var(--sidebar-foreground))] opacity-30 text-center">
            v{env.appVersion}
          </p>
        )}
      </div>
    </aside>
  )
}
