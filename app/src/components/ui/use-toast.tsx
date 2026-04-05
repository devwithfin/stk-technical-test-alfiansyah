import * as React from 'react'

import { Toast, ToastDescription, ToastTitle } from '@/components/ui/toast'

type ToastOptions = {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: 'default' | 'success' | 'destructive'
  duration?: number
}

type ToastRecord = ToastOptions & { id: string }

type ToastContextValue = {
  toast: (options: ToastOptions) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

const DEFAULT_DURATION = 4000

function useToastContext() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function getId() {
  return Math.random().toString(36).slice(2, 9)
}

function useToastQueue() {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([])
  const timeouts = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    const timeout = timeouts.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeouts.current.delete(id)
    }
  }, [])

  const push = React.useCallback(
    (options: ToastOptions) => {
      const id = getId()
      setToasts((prev) => [...prev, { id, ...options }])
      const duration = options.duration ?? DEFAULT_DURATION
      if (duration !== Infinity) {
        const timeout = setTimeout(() => {
          dismiss(id)
        }, duration)
        timeouts.current.set(id, timeout)
      }
    },
    [dismiss],
  )

  React.useEffect(
    () => () => {
      timeouts.current.forEach((timeout) => clearTimeout(timeout))
      timeouts.current.clear()
    },
    [],
  )

  return { toasts, push, dismiss }
}

type ToastProviderProps = {
  children: React.ReactNode
}

function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, push, dismiss } = useToastQueue()

  return (
    <ToastContext.Provider value={{ toast: push }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[9999] flex items-start justify-end px-4 py-6 sm:px-6">
        <div className="flex w-full max-w-sm flex-col gap-3">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              variant={toast.variant}
              className="pointer-events-auto"
              onDismiss={() => dismiss(toast.id)}
            >
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
            </Toast>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

function useToast() {
  return useToastContext()
}

export { ToastProvider, useToast }
