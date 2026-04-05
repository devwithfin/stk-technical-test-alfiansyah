import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

export type ApiMenuNode = {
  id: string
  menu_name: string
  menu_parent: string | null
  menu_level: number
  menu_order: number
  children?: ApiMenuNode[]
}

export async function fetchMenus(signal?: AbortSignal): Promise<ApiMenuNode[]> {
  try {
    const response = await api.get<ApiMenuNode[]>('/menu', { signal })
    return response.data
  } catch (error) {
    if (isRequestCanceled(error)) {
      throw error
    }
    throw new Error(resolveMessage(error, 'Failed to load menu list'))
  }
}

export async function fetchMenu(id: string, signal?: AbortSignal): Promise<ApiMenuNode> {
  try {
    const response = await api.get<ApiMenuNode>(`/menu/${id}`, { signal })
    return response.data
  } catch (error) {
    if (isRequestCanceled(error)) {
      throw error
    }
    throw new Error(resolveMessage(error, 'Menu not found'))
  }
}

export type CreateMenuPayload = {
  menu_name: string
  menu_parent: string | null
  menu_level: number
  menu_order: number
}

export async function createMenu(payload: CreateMenuPayload) {
  try {
    const response = await api.post('/menu', payload)
    return response.data
  } catch (error) {
    if (isRequestCanceled(error)) {
      throw error
    }
    throw new Error(resolveMessage(error, 'Failed to create menu'))
  }
}

export type UpdateMenuPayload = {
  menu_name?: string
  menu_parent?: string | null
  menu_level?: number
  menu_order?: number
}

export async function updateMenu(id: string, payload: UpdateMenuPayload) {
  if (payload.menu_parent && payload.menu_parent === id) {
    throw new Error('A menu cannot be its own parent')
  }
  try {
    const response = await api.put(`/menu/${id}`, payload)
    return response.data
  } catch (error) {
    if (isRequestCanceled(error)) {
      throw error
    }
    throw new Error(resolveMessage(error, 'Failed to update menu'))
  }
}

export async function deleteMenu(id: string) {
  try {
    const response = await api.delete(`/menu/${id}`)
    return response.data
  } catch (error) {
    if (isRequestCanceled(error)) {
      throw error
    }
    throw new Error(resolveMessage(error, 'Failed to delete menu'))
  }
}

export function isRequestCanceled(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const message = error.message?.toLowerCase()
    return error.code === 'ERR_CANCELED' || message === 'canceled'
  }
  return false
}

function resolveMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === 'string' && data.trim().length) {
      return data
    }
    if (data && typeof data === 'object' && 'message' in data) {
      const maybeMessage = (data as { message?: unknown }).message
      if (typeof maybeMessage === 'string' && maybeMessage.trim().length) {
        return maybeMessage
      }
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}
