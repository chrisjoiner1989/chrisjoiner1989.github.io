'use client'

import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'

interface AppShellProps {
  children: React.ReactNode
  /** Optional top bar content */
  header?: React.ReactNode
  /** Remove bottom padding for full-bleed pages (bible reader, preaching mode) */
  fullBleed?: boolean
}

export function AppShell({ children, header, fullBleed = false }: AppShellProps) {
  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <SideNav />

      <div className="flex flex-col min-h-dvh md:pl-56">
        {header && (
          <header
            className="sticky top-0 z-30 pt-[env(safe-area-inset-top)]"
            style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}
          >
            {header}
          </header>
        )}
        <main
          className={[
            'flex-1 overflow-y-auto',
            fullBleed ? '' : 'px-4 pb-20 md:pb-6',
          ].filter(Boolean).join(' ')}
        >
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
