import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type NavItem = {
  path: string
  label: string
  icon: LucideIcon
}

type SidebarProps = {
  items: NavItem[]
  activePath: string
  onSelect: (path: string) => void
  brand: {
    acronym: string
    title: string
    subtitle: string
  }
  className?: string
  onClose?: () => void
}

function Sidebar({ items, activePath, onSelect, brand, className, onClose }: SidebarProps) {
  return (
    <aside className={cn('flex h-full flex-col border-r border-slate-200 bg-white px-6 py-6', className)}>
      <div className="flex items-start gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-semibold text-white">
            {brand.acronym}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{brand.title}</p>
            <p className="text-xs text-slate-500">{brand.subtitle}</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="text-slate-500 lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="mt-8 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activePath === item.path
          return (
            <Button
              key={item.path}
              variant={isActive ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => onSelect(item.path)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}

export type { NavItem }
export default Sidebar
