import { Breadcrumb } from '../breadcrumb/Breadcrumb'
import { UserMenu } from './UserMenu'

export function Topbar() {
  return (
    <header
      className="flex h-[var(--topbar-height)] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6"
      role="banner"
    >
      <Breadcrumb />
      <UserMenu />
    </header>
  )
}
