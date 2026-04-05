import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useMenuParents } from '@/hooks/useMenus'
import { fetchMenu, isRequestCanceled, updateMenu } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

function MenuEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [menuName, setMenuName] = useState('')
  const [selectedParent, setSelectedParent] = useState<string>('root')
  const [menuLevel, setMenuLevel] = useState<number | null>(null)
  const [menuOrderInput, setMenuOrderInput] = useState<string>('1')
  const [originalParent, setOriginalParent] = useState<string>('root')
  const [originalOrder, setOriginalOrder] = useState<number>(1)
  const [menuLoading, setMenuLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    parents: flatMenus,
    loading: parentsLoading,
    error: parentsError,
  } = useMenuParents(id)
  const parentOptions = useMemo<ParentOption[]>(
    () => flatMenus.map((item) => ({ id: item.id, menu_name: item.menu_name })),
    [flatMenus],
  )

  const siblingsForParent = useCallback(
    (parentId: string) => flatMenus.filter((item) => (item.parentId ?? 'root') === parentId),
    [flatMenus],
  )

  const parentChangeRef = useRef<string | null>(null)
  const skipParentEffect = useRef(false)

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    const load = async () => {
      try {
        setMenuLoading(true)
        setError(null)
        const data = await fetchMenu(id, controller.signal)
        setMenuName(data.menu_name)
        const normalizedParent = data.menu_parent ?? 'root'
        setSelectedParent(normalizedParent)
        skipParentEffect.current = true
        setOriginalParent(normalizedParent)
        setMenuLevel(data.menu_level)
        setMenuOrderInput(String(data.menu_order))
        setOriginalOrder(data.menu_order)
      } catch (err) {
        if (isRequestCanceled(err)) return
        setError(err instanceof Error ? err.message : 'Failed to load menu')
      } finally {
        setMenuLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [id])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id) return
    if (!menuName.trim()) {
      setSubmitError('Menu name is required')
      return
    }
    try {
      setSaving(true)
      setSubmitError(null)
      const normalizedParent = selectedParent === 'root' ? null : selectedParent
      const desiredOrder = Math.max(1, Math.floor(Number(menuOrderInput || '1')))
      const siblings = siblingsForParent(selectedParent).filter((s) => s.id !== id)
      const maxOrder = selectedParent === originalParent ? siblings.length + 1 : siblings.length + 1
      const sanitizedOrder = Math.min(desiredOrder, maxOrder)
      const conflict =
        selectedParent === originalParent
          ? siblings.find((s) => s.menu_order === sanitizedOrder)
          : null
      await updateMenu(id, {
        menu_name: menuName.trim(),
        menu_parent: normalizedParent,
        menu_order: sanitizedOrder,
      })
      if (conflict) {
        await updateMenu(conflict.id, { menu_order: originalOrder })
      }
      toast({
        title: 'Changes saved',
        description: `${menuName.trim()} was updated successfully.`,
        variant: 'success',
      })
      navigate('/menu')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update menu'
      setSubmitError(message)
      toast({
        title: 'Failed to update menu',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!id) return
    if (skipParentEffect.current) {
      skipParentEffect.current = false
      parentChangeRef.current = selectedParent
      return
    }
    if (selectedParent !== parentChangeRef.current) {
      const siblings = siblingsForParent(selectedParent).filter((s) => s.id !== id)
      setMenuOrderInput(String(siblings.length + 1))
    }
    parentChangeRef.current = selectedParent
  }, [selectedParent, siblingsForParent, id])

  const combinedLoading = menuLoading || parentsLoading
  const combinedError = error ?? parentsError
  const isReadOnly = combinedLoading || !id

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border border-indigo-100 bg-white shadow-md">
        <CardHeader>
          <CardTitle>Edit Menu Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {combinedError && <p className="text-sm text-red-500">{combinedError}</p>}
          {submitError && <p className="text-sm text-red-500">{submitError}</p>}
          <div>
            <label className="text-sm text-slate-500">Menu Name</label>
            <Input
              className="mt-1"
              placeholder="Menu name"
              value={menuName}
              disabled={isReadOnly}
              onChange={(event) => setMenuName(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-500">Parent Menu</label>
              {combinedLoading ? (
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
            <div>
              <label className="text-sm text-slate-500">Menu Level</label>
              <Input className="mt-1" readOnly value={menuLevel ?? '-'} />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-500">Menu Order</label>
            <Input
              className="mt-1"
              type="number"
              min={1}
              value={menuOrderInput}
              onChange={(event) => setMenuOrderInput(event.target.value.replace(/^0+(?=\d)/, ''))}
              disabled={isReadOnly}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate('/menu')} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || combinedLoading}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

export default MenuEditPage

type ParentOption = { id: string; menu_name: string }
