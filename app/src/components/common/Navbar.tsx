import { Bell, Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'

type NavbarProps = {
  title: string
  onToggleSidebar?: () => void
}

function Navbar({ title, onToggleSidebar }: NavbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-6">
      <div className="flex flex-1 items-center gap-3">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-600 hover:text-slate-900 lg:hidden"
            onClick={onToggleSidebar}
            aria-label="Buka navigasi"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="truncate text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
          ZA
        </div>
      </div>
    </header>
  )
}

export default Navbar
