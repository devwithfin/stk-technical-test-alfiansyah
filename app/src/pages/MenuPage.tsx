import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DataTable from '@/components/common/DataTable'
import MenuTree from '@/components/common/MenuTree'
import { Button } from '@/components/ui/button'
import { deleteMenu } from '@/lib/api'
import { useMenus } from '@/hooks/useMenus'
import { useToast } from '@/components/ui/use-toast'

const tabs = [
  { id: 'datatable', label: 'Datatable' },
  { id: 'tree', label: 'Tree Interface' },
]

function MenuPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const navigate = useNavigate()
  const { treeData, tableRows, loading, error, reload } = useMenus()
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [mutating, setMutating] = useState(false)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    try {
      setMutating(true)
      setMutationError(null)
      await deleteMenu(id)
      await reload()
      toast({
        title: 'Menu deleted',
        description: 'The menu item and its descendants have been removed.',
        variant: 'success',
      })
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Failed to delete menu')
      setMutating(false)
      toast({
        title: 'Failed to delete menu',
        description: err instanceof Error ? err.message : 'Failed to delete menu',
        variant: 'destructive',
      })
    } finally {
      setMutating(false)
    }
  }

  const combinedLoading = loading || mutating
  const combinedError = mutationError ?? error

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'secondary'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'datatable' ? (
        <DataTable
          rows={tableRows}
          loading={combinedLoading}
          error={combinedError}
          onAdd={() => navigate('/menu/add')}
          onEdit={(id) => navigate(`/menu/${id}/edit`)}
          onDelete={handleDelete}
        />
      ) : (
        <MenuTree items={treeData} />
      )}
    </div>
  )
}

export default MenuPage
