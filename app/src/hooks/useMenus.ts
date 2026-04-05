import { useCallback, useEffect, useState } from 'react'

import type { MenuRow } from '@/components/common/DataTable'
import type { MenuTreeNode } from '@/components/common/MenuTree'
import { fetchMenus, isRequestCanceled, type ApiMenuNode } from '@/lib/api'

export type FlattenMenuItem = {
  id: string
  menu_name: string
  menu_level: number
  menu_order: number
  parentId: string | null
}

type UseMenusResult = {
  treeData: MenuTreeNode[]
  tableRows: MenuRow[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

type UseMenuParentsResult = {
  parents: FlattenMenuItem[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

export function useMenus(): UseMenusResult {
  const [treeData, setTreeData] = useState<MenuTreeNode[]>([])
  const [tableRows, setTableRows] = useState<MenuRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMenus = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchMenus(signal)
        setTreeData(mapTree(data))
        setTableRows(flattenRows(data))
      } catch (err) {
        if (isRequestCanceled(err)) return
        setError(err instanceof Error ? err.message : 'An error occurred while loading menus')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    const controller = new AbortController()
    loadMenus(controller.signal)
    return () => controller.abort()
  }, [loadMenus])

  const reload = useCallback(async () => {
    await loadMenus()
  }, [loadMenus])

  return { treeData, tableRows, loading, error, reload }
}

export function useMenuParents(skipId?: string): UseMenuParentsResult {
  const [parents, setParents] = useState<FlattenMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadParents = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true)
        setError(null)
        const tree = await fetchMenus(signal)
        setParents(flattenMenuItems(tree, null, skipId))
      } catch (err) {
        if (isRequestCanceled(err)) return
        setError(err instanceof Error ? err.message : 'Failed to load parent menu list')
      } finally {
        setLoading(false)
      }
    },
    [skipId],
  )

  useEffect(() => {
    const controller = new AbortController()
    loadParents(controller.signal)
    return () => controller.abort()
  }, [loadParents])

  const reload = useCallback(async () => {
    await loadParents()
  }, [loadParents])

  return { parents, loading, error, reload }
}

const flattenRows = (nodes: ApiMenuNode[]): MenuRow[] => {
  const rows: MenuRow[] = []
  const traverse = (items: ApiMenuNode[], parentName: string | null) => {
    items.forEach((item) => {
      const level = Math.max(1, item.menu_level)
      const order = Math.max(1, item.menu_order)
      rows.push({
        id: item.id,
        name: item.menu_name,
        parent: parentName ?? '-',
        level: `Level ${level}`,
        order,
      })
      if (item.children?.length) {
        traverse(item.children, item.menu_name)
      }
    })
  }
  traverse(nodes, null)
  return rows
}

const mapTree = (nodes: ApiMenuNode[]): MenuTreeNode[] =>
  nodes.map((node) => ({
    id: node.id,
    title: node.menu_name,
    children: node.children?.length ? mapTree(node.children) : undefined,
  }))

const flattenMenuItems = (
  nodes: ApiMenuNode[],
  parentId: string | null = null,
  skipId?: string,
  list: FlattenMenuItem[] = [],
) => {
  nodes.forEach((node) => {
    if (node.id === skipId) return
    list.push({
      id: node.id,
      menu_name: node.menu_name,
      menu_level: node.menu_level,
      menu_order: node.menu_order,
      parentId,
    })
    if (node.children?.length) {
      flattenMenuItems(node.children, node.id, skipId, list)
    }
  })
  return list
}
