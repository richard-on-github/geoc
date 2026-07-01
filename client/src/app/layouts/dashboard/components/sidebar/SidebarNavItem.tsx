import { ChevronDown } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import { cn } from '@/shared/lib'
import { useSidebarStore } from '@/app/stores'
import type { NavItem } from '@/app/config'

interface SidebarNavItemProps {
  item: NavItem
  isCollapsed: boolean
}

export function SidebarNavItem({ item, isCollapsed }: SidebarNavItemProps) {
  const location = useLocation()
  const { openSections, toggleSection } = useSidebarStore()

  const hasChildren = item.children !== undefined && item.children.length > 0
  const isOpen = openSections.includes(item.id)
  const isActive = item.href !== undefined
    ? location.pathname === item.href
    : item.children?.some((c) => location.pathname.startsWith(c.href)) ?? false

  const Icon = item.icon

  /* ---- Entrée avec sous-menu ---- */
  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => toggleSection(item.id)}
          aria-expanded={isOpen}
          title={isCollapsed ? item.label : undefined}
          className={cn(
            'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]',
            isActive && 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]',
          )}
        >
          <Icon
            size={18}
            className={cn(
              'shrink-0 transition-colors',
              isActive ? 'text-[hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-foreground))] opacity-70',
            )}
            aria-hidden="true"
          />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown
                size={14}
                className={cn(
                  'shrink-0 transition-transform duration-200 opacity-60',
                  isOpen && 'rotate-180',
                )}
                aria-hidden="true"
              />
            </>
          )}
        </button>

        {/* Sous-menu */}
        {!isCollapsed && isOpen && (
          <div className="mt-1 ml-3 space-y-0.5 border-l border-[hsl(var(--sidebar-border))] pl-3">
            {item.children?.map((child) => (
              <NavLink
                key={child.id}
                to={child.href}
                className={({ isActive: childActive }) =>
                  cn(
                    'flex items-center rounded-md px-2 py-1.5 text-sm transition-colors',
                    childActive
                      ? 'text-[hsl(var(--sidebar-primary))] font-medium'
                      : 'text-[hsl(var(--sidebar-foreground))] opacity-70 hover:opacity-100 hover:text-[hsl(var(--sidebar-accent-foreground))]',
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ---- Entrée simple ---- */
  return (
    <NavLink
      to={item.href ?? '#'}
      title={isCollapsed ? item.label : undefined}
      className={({ isActive: linkActive }) =>
        cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]',
          linkActive && 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]',
        )
      }
    >
      {({ isActive: linkActive }) => (
        <>
          <Icon
            size={18}
            className={cn(
              'shrink-0',
              linkActive ? 'text-[hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-foreground))] opacity-70',
            )}
            aria-hidden="true"
          />
          {!isCollapsed && (
            <span className="flex-1">{item.label}</span>
          )}
          {!isCollapsed && item.badge !== undefined && (
            <span className="rounded-full bg-[hsl(var(--sidebar-primary))] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}
