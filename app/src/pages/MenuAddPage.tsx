import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useMenuParents } from '@/hooks/useMenus'
import { createMenu } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

function MenuAddPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { parents: parentOptions, loading: parentLoading, error } = useMenuParents()
  const [selectedParent, setSelectedParent] = useState<string>('root')
  const [menuName, setMenuName] = useState('')
  const [menuOrderInput, setMenuOrderInput] = useState(1)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const parentLevel = useMemo(() => {
    if (selectedParent === 'root') return 0
    return parentOptions.find((option) => option.id === selectedParent)?.menu_level ?? 0
  }, [parentOptions, selectedParent])

  const computedLevel = parentLevel + 1
  const computedOrder = useMemo(() => {
    if (selectedParent === 'root') {
      return parentOptions.filter((item) => item.parentId === null).length + 1
    }
    return parentOptions.filter((item) => item.parentId === selectedParent).length + 1
  }, [parentOptions, selectedParent])

  useEffect(() => {
    setMenuOrderInput(computedOrder)
  }, [computedOrder])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!menuName.trim()) {
      setSubmitError('Menu name is required')
      return
    }
    try {
      setSaving(true)
      setSubmitError(null)
      await createMenu({
        menu_name: menuName.trim(),
        menu_parent: selectedParent === 'root' ? null : selectedParent,
        menu_level: computedLevel,
        menu_order: computedOrder,
      })
      toast({
        title: 'Menu created',
        description: `${menuName.trim()} was added successfully.`,
        variant: 'success',
      })
      navigate('/menu')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save menu'
      setSubmitError(message)
      toast({
        title: 'Failed to save menu',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border border-indigo-100 bg-white shadow-md">
        <CardHeader>
          <CardTitle>New Menu Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          {submitError && <p className="text-sm text-red-500">{submitError}</p>}
          <div>
            <label className="text-sm text-slate-500">Menu Name</label>
            <Input
              className="mt-1"
              placeholder="e.g. Signature Rice Bowl"
              value={menuName}
              onChange={(event) => setMenuName(event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-500">Menu Parent</label>
            {parentLoading ? (
              <Input className="mt-1" readOnly value="Loading..." />
            ) : (
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={selectedParent}
                onChange={(event) => setSelectedParent(event.target.value)}
              >
                <option value="root">Root</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.menu_name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-500">Menu Level</label>
              <Input className="mt-1" readOnly value={computedLevel} />
            </div>
            <div>
              <label className="text-sm text-slate-500">Menu Order</label>
              <Input className="mt-1" readOnly value={menuOrderInput} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate('/menu')} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

export default MenuAddPage
