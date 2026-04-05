import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

type TreeNode = {
  id: string
  title: string
  children?: TreeNode[]
}

type MenuTreeProps = {
  items: TreeNode[]
}

export type { TreeNode as MenuTreeNode }

type TreeItemProps = {
  node: TreeNode
  depth: number
}

function TreeItem({ node, depth }: TreeItemProps) {
  const hasChildren = Boolean(node.children?.length)
  const [open, setOpen] = useState(true)

  const connectorOffset = depth === 0 ? -6 : depth === 1 ? -32 : depth > 1 ? -34 : 0
  const connectorWidth = 14
  const textPadding = depth === 0 ? 'pl-1' : '-ml-1 pl-1'
  const caretMargin = '-ml-5'
  const liPadding = depth === 0 ? 'pl-6' : 'pl-1'
  return (
    <li className={cn('relative', liPadding)}>
          {(depth > 0 || depth === 0) && (
        <span
          aria-hidden
          className="absolute top-0 bottom-0 w-0.5 bg-slate-400"
          style={{ left: connectorOffset }}
        />
      )}
      {(depth > 0 || depth === 0) && (
        <span
          aria-hidden
          className="absolute top-4 h-0.5 bg-slate-400"
          style={{ left: connectorOffset, width: connectorWidth }}
        />
      )}
      <div
        className={cn(
          'group flex items-center gap-2 rounded-md py-1 pr-3 text-sm text-slate-700 transition-colors hover:bg-slate-50',
          textPadding
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={open ? `Hide ${node.title}` : `Show ${node.title}`}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className={cn(
              caretMargin,
              'inline-flex h-5 w-5 items-center justify-center rounded-sm text-slate-500 transition hover:text-slate-900'
            )}
          >
            <ChevronRight
              strokeWidth={1.4}
              className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-90')}
            />
          </button>
        ) : (
          <span className="-ml-5 inline-flex h-5 w-5" />
        )}
        <span className="text-sm text-slate-700 group-hover:text-slate-900">{node.title}</span>
      </div>
      {hasChildren && open && node.children ? <TreeBranch nodes={node.children} depth={depth + 1} /> : null}
    </li>
  )
}

type TreeBranchProps = {
  nodes: TreeNode[]
  depth: number
}

function TreeBranch({ nodes, depth }: TreeBranchProps) {
  const rootLineClass =
    depth === 0 ? 'before:absolute before:left-[-6px] before:top-0 before:bottom-0 before:border-l-2 before:border-slate-400' : ''
  const branchPadding = depth === 0 ? 'pl-0' : 'pl-6'
  return (
    <ul className={cn('relative space-y-1', branchPadding, rootLineClass)}>
      {nodes.map((node) => (
        <TreeItem key={node.id} node={node} depth={depth} />
      ))}
    </ul>
  )
}

function MenuTree({ items }: MenuTreeProps) {
  if (!items.length) {
    return (
      <div className="menu-tree-wrapper">
        <p className="text-sm text-slate-500">No menu data yet.</p>
      </div>
    )
  }
  return (
    <div className="menu-tree-wrapper overflow-x-auto">
      <div className="min-w-[320px]">
        <TreeBranch nodes={items} depth={0} />
      </div>
    </div>
  )
}

export default MenuTree
