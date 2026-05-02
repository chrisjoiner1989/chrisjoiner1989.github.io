import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-10 px-4 text-sm gap-2',
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--accent-primary)] text-white font-medium ' +
    'hover:bg-[var(--accent-secondary)] active:bg-[var(--accent-secondary)]',
  secondary:
    'bg-transparent text-[var(--text-primary)] font-medium ' +
    'border border-[var(--border-color)] ' +
    'hover:bg-[var(--surface-hover)] active:bg-[var(--surface-hover)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] font-medium ' +
    'hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
  danger:
    'bg-[#dc2626] text-white font-medium ' +
    'hover:bg-[#b91c1c] active:bg-[#b91c1c]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth,
      loading,
      iconLeft,
      iconRight,
      disabled,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center rounded-[var(--radius-md)]',
          'transition-colors duration-[var(--dur-fast)]',
          'whitespace-nowrap select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth ? 'w-full' : '',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" size={size === 'sm' ? 12 : 14} /> : iconLeft}
        {children}
        {!loading && iconRight}
      </button>
    )
  },
)
Button.displayName = 'Button'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'secondary' | 'danger'
  size?: 'sm' | 'md'
  'aria-label': string
  children: ReactNode
}

const iconSizeClasses: Record<NonNullable<IconButtonProps['size']>, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
}

const iconVariantClasses: Record<NonNullable<IconButtonProps['variant']>, string> = {
  ghost:
    'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]',
  secondary:
    'text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--surface-hover)]',
  danger:
    'text-[#dc2626] hover:bg-[#fee2e2] dark:hover:bg-[#7f1d1d]/30',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      className={[
        'inline-flex items-center justify-center rounded-[var(--radius-md)]',
        'transition-colors duration-[var(--dur-fast)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        iconSizeClasses[size],
        iconVariantClasses[variant],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  ),
)
IconButton.displayName = 'IconButton'
