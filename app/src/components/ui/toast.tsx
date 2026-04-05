import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border-slate-200 text-slate-900',
        success: 'border-emerald-100 bg-emerald-50 text-emerald-900',
        destructive: 'border-red-200 bg-red-50 text-red-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-slate-600', className)} {...props} />
))
ToastDescription.displayName = 'ToastDescription'

const ToastTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
  ),
)
ToastTitle.displayName = 'ToastTitle'

type ToastProps = React.HTMLAttributes<HTMLLIElement> &
  VariantProps<typeof toastVariants> & {
    onDismiss?: () => void
  }

function Toast({ className, variant, onDismiss, ...props }: ToastProps) {
  return (
    <li className={cn(toastVariants({ variant }), className)} {...props}>
      <div className="flex-1">{props.children}</div>
      <button
        type="button"
        aria-label="Close"
        onClick={onDismiss}
        className="h-6 w-6 rounded-full text-slate-400 transition hover:text-slate-600"
      >
        ×
      </button>
    </li>
  )
}

export { Toast, ToastTitle, ToastDescription }
