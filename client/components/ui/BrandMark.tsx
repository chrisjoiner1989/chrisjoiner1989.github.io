import { CSSProperties } from 'react'

type Size = 'sm' | 'md' | 'lg' | 'xl'

interface BrandMarkProps {
  size?: Size
  withWordmark?: boolean
  className?: string
}

const SIZE_PX: Record<Size, { box: number; icon: number; radius: number; text: string }> = {
  sm: { box: 22, icon: 12, radius: 6,  text: 'text-sm' },
  md: { box: 28, icon: 15, radius: 7,  text: 'text-[15px]' },
  lg: { box: 40, icon: 22, radius: 10, text: 'text-xl' },
  xl: { box: 64, icon: 36, radius: 16, text: 'text-3xl' },
}

export function BrandMark({ size = 'md', withWordmark = false, className = '' }: BrandMarkProps) {
  const s = SIZE_PX[size]

  const boxStyle: CSSProperties = {
    width: s.box,
    height: s.box,
    borderRadius: s.radius,
    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
    color: '#fff',
    boxShadow: `0 4px 16px rgba(107, 70, 193, 0.35)`,
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="inline-flex items-center justify-center flex-shrink-0"
        style={boxStyle}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width={s.icon}
          height={s.icon}
        >
          <path d="M3 20l5-13 4 9 3-6 6 10z" />
        </svg>
      </span>
      {withWordmark && (
        <span
          className={`${s.text} font-semibold tracking-tight`}
          style={{ color: 'var(--text-primary)' }}
        >
          Mount Builder
        </span>
      )}
    </span>
  )
}
