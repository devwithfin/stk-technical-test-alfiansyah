import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, MenuSquare } from 'lucide-react'

import Navbar from '@/components/common/Navbar'
import Sidebar, { type NavItem } from '@/components/common/Sidebar'

const navigation: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/menu', label: 'Menu', icon: MenuSquare },
]

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const activePath = navigation.find((item) => location.pathname.startsWith(item.path)) ?? navigation[0]
  const handleNavigate = (path: string) => {
    navigate(path)
    setMobileSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-10 h-full w-72 max-w-full">
            <Sidebar
              className="h-full shadow-2xl"
              items={navigation}
              activePath={activePath.path}
              onSelect={handleNavigate}
              brand={{ acronym: 'ST', title: 'Studio Teknologi', subtitle: 'Alfiansyah Cahyo W' }}
              onClose={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}
      <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[240px_1fr]">
        <div className="hidden lg:block">
          <Sidebar
            className="h-full"
            items={navigation}
            activePath={activePath.path}
            onSelect={handleNavigate}
            brand={{ acronym: 'ST', title: 'Studio Teknologi', subtitle: 'Alfiansyah Cahyo W' }}
          />
        </div>

        <div className="flex flex-col">
          <Navbar title={activePath.label} onToggleSidebar={() => setMobileSidebarOpen(true)} />

          <main className="flex-1 space-y-6 bg-slate-50 px-4 py-6 sm:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
