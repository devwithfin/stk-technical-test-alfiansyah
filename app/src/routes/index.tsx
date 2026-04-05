import { Navigate, useRoutes, type RouteObject } from 'react-router-dom'

import AppLayout from '@/layouts/AppLayout'
import DashboardPage from '@/pages/DashboardPage'
import MenuAddPage from '@/pages/MenuAddPage'
import MenuEditPage from '@/pages/MenuEditPage'
import MenuPage from '@/pages/MenuPage'

const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'menu/add', element: <MenuAddPage /> },
      { path: 'menu/:id/edit', element: <MenuEditPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]

export default function AppRoutes() {
  return useRoutes(appRoutes)
}
