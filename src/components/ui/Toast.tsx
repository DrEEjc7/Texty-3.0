import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  isVisible: boolean
}

export function Toast({ message, isVisible }: ToastProps) {
  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--color-text-primary)] text-[var(--color-text-inverse)] px-6 py-4 rounded-lg shadow-md transition-transform duration-300 z-[1000] font-medium text-sm',
        isVisible ? 'translate-y-0' : 'translate-y-[200%]'
      )}
    >
      {message}
    </div>
  )
}
