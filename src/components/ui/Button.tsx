import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'case'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'outline', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center px-4 py-2 border rounded-lg font-medium text-sm transition-all outline-none whitespace-nowrap min-h-[36px]'

    const variantStyles = {
      primary: 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] border-[var(--color-primary)] hover:opacity-90',
      outline: 'bg-transparent text-[var(--color-text-primary)] border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] hover:border-[var(--color-text-primary)]',
      case: 'text-xs px-2 py-1 min-h-[32px]',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          isLoading && 'opacity-50 cursor-not-allowed',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && !isLoading && 'hover:-translate-y-0.5 hover:shadow-sm',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
