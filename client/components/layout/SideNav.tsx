'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Library, Calendar, Settings, PenLine } from 'lucide-react'
import { BrandMark } from '@/components/ui/BrandMark'

const PRIMARY_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/builder', label: 'Builder', icon: PenLine },
  { href: '/bible', label: 'Bible', icon: BookOpen },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
]

const FOOTER_ITEMS = [
  { href: '/settings', label: 'Settings', icon: Settings },
]

export const SIDE_NAV_WIDTH = 224 // px — matches w-56

export function SideNav() {
  const pathname = usePathname()

  const hide = pathname === '/preaching' || pathname === '/welcome'
  if (hide) return null

  const renderItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Home }) => {
    const active = href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/')
    return (
      <li key={href}>
        <Link
          href={href}
          aria-current={active ? 'page' : undefined}
          className={[
            'flex items-center gap-2.5 h-9 px-3 rounded-[var(--radius-md)]',
            'text-sm transition-colors duration-[var(--dur-fast)]',
            active
              ? 'bg-[var(--surface-hover)] text-[var(--text-primary)] font-medium'
              : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
          ].join(' ')}
        >
          <Icon
            size={16}
            strokeWidth={active ? 2.25 : 1.75}
            className={active ? 'text-[var(--accent-primary)]' : ''}
          />
          <span>{label}</span>
        </Link>
      </li>
    )
  }

  return (
    <aside
      aria-label="Main navigation"
      className="hidden md:flex fixed inset-y-0 left-0 z-40 w-56 flex-col border-r"
      style={{
        backgroundColor: 'var(--surface-sunken)',
        borderColor: 'var(--border-subtle)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Brand */}
      <div className="px-4 h-14 flex items-center border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link href="/" aria-label="Mount Builder — home">
          <BrandMark size="md" withWordmark />
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">{PRIMARY_ITEMS.map(renderItem)}</ul>
      </nav>

      {/* Footer */}
      <div className="px-2 py-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <ul className="space-y-0.5">{FOOTER_ITEMS.map(renderItem)}</ul>
      </div>
    </aside>
  )
}
