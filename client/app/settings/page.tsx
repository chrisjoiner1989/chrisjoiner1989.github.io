'use client'

import { useState, useEffect } from 'react'
import {
  Sun, Moon, BookOpen, Trash2, CloudUpload, LogOut, RefreshCw, AlertTriangle,
  Palette, Database, UserCircle2,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { ConfirmModal } from '@/components/ui/Modal'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useSermonStore } from '@/store/sermonStore'
import { getCacheStats, clearCache } from '@/lib/bibleApi'
import { storageSize } from '@/lib/utils'
import type { Theme, FontSize } from '@/types'

type AuthTab = 'login' | 'register'
type SettingsSectionKey = 'appearance' | 'data' | 'account'

const SECTIONS: { key: SettingsSectionKey; label: string; icon: typeof Palette; description: string }[] = [
  { key: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and reading preferences' },
  { key: 'data', label: 'Data', icon: Database, description: 'Storage, cache, and exports' },
  { key: 'account', label: 'Account & Sync', icon: UserCircle2, description: 'Sign in and cloud backup' },
]

export default function SettingsPage() {
  const { theme, fontSize, setTheme, setFontSize } = useThemeStore()
  const { user, isAuthenticated, login, register, logout, syncNow, uploadAllToCloud, syncStatus } = useAuthStore()
  const { sermons, loadSermons } = useSermonStore()

  const [authTab, setAuthTab] = useState<AuthTab>('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [cacheStats, setCacheStats] = useState({ entries: 0, hitRate: 0 })
  const [showClearData, setShowClearData] = useState(false)
  const [showClearCache, setShowClearCache] = useState(false)

  // Desktop section navigation
  const [activeSection, setActiveSection] = useState<SettingsSectionKey>('appearance')

  useEffect(() => {
    loadSermons()
    setCacheStats(getCacheStats())
  }, [loadSermons])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError(''); setAuthLoading(true)
    try { await login(loginEmail, loginPassword) }
    catch (err: any) { setAuthError(err.message) }
    finally { setAuthLoading(false) }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError(''); setAuthLoading(true)
    try { await register(regName, regEmail, regPassword) }
    catch (err: any) { setAuthError(err.message) }
    finally { setAuthLoading(false) }
  }

  const handleClearData = () => {
    localStorage.clear()
    window.location.reload()
  }

  const handleClearCache = () => {
    clearCache()
    setCacheStats(getCacheStats())
    setShowClearCache(false)
  }

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun size={16} /> },
    { value: 'sepia', label: 'Sepia', icon: <BookOpen size={16} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
  ]

  const fontSizes: { value: FontSize; label: string }[] = [
    { value: 'small', label: 'Sm' }, { value: 'medium', label: 'Md' },
    { value: 'large', label: 'Lg' }, { value: 'xlarge', label: 'XL' },
  ]

  /* ─── Reusable section renderers (used by both mobile + desktop) ─── */

  const AppearanceContent = (
    <div className="space-y-5">
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2.5"
          style={{ color: 'var(--text-muted)' }}
        >
          Theme
        </p>
        <div className="grid grid-cols-3 gap-2 max-w-md">
          {themes.map(({ value, label, icon }) => {
            const swatch = value === 'light' ? '#ffffff' : value === 'sepia' ? '#f4ede4' : '#0d0d10'
            const fg = value === 'dark' ? '#e8e8f0' : '#1a1a2e'
            const active = theme === value
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className="rounded-[var(--radius-lg)] overflow-hidden transition-all"
                style={{
                  border: `2px solid ${active ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                }}
              >
                <div
                  className="h-16 flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: swatch, color: fg }}
                >
                  {icon}
                  <span className="text-sm font-semibold">Aa</span>
                </div>
                <div
                  className="text-[11px] font-medium py-1.5 capitalize"
                  style={{
                    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    backgroundColor: 'var(--surface)',
                  }}
                >
                  {label}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2.5"
          style={{ color: 'var(--text-muted)' }}
        >
          Font Size
        </p>
        <div className="flex gap-2 max-w-md">
          {fontSizes.map(({ value, label }, i) => {
            const active = fontSize === value
            return (
              <button
                key={value}
                onClick={() => setFontSize(value)}
                className="flex-1 rounded-[var(--radius-md)] transition-colors flex items-center justify-center"
                style={{
                  backgroundColor: active ? 'var(--surface-hover)' : 'transparent',
                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  fontSize: `${12 + i * 3}px`,
                  height: '52px',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  const DataContent = (
    <div className="space-y-5">
      <dl className="space-y-3 max-w-md">
        <div className="flex justify-between text-sm">
          <dt style={{ color: 'var(--text-secondary)' }}>Sermons stored</dt>
          <dd className="font-semibold" style={{ color: 'var(--text-primary)' }}>{sermons.length}</dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt style={{ color: 'var(--text-secondary)' }}>Storage used</dt>
          <dd className="font-semibold" style={{ color: 'var(--text-primary)' }}>{storageSize()}</dd>
        </div>
        <div className="h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
        <div className="flex justify-between text-sm">
          <dt style={{ color: 'var(--text-secondary)' }}>Bible chapters cached</dt>
          <dd className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cacheStats.entries}</dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt style={{ color: 'var(--text-secondary)' }}>Cache hit rate</dt>
          <dd className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cacheStats.hitRate}%</dd>
        </div>
      </dl>

      <div className="flex flex-col sm:flex-row gap-2 max-w-md">
        <button
          onClick={() => setShowClearCache(true)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-[var(--radius-md)] border text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
        >
          <Trash2 size={13} /> Clear Bible Cache
        </button>
        <button
          onClick={() => setShowClearData(true)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-[var(--radius-md)] border text-xs font-medium transition-colors"
          style={{ borderColor: '#dc2626', color: '#dc2626' }}
        >
          <AlertTriangle size={13} /> Clear All Data
        </button>
      </div>
    </div>
  )

  const AccountContent = isAuthenticated && user ? (
    <div className="space-y-5 max-w-md">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-semibold"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
        </div>
      </div>

      <div
        className="rounded-[var(--radius-md)] border p-3 space-y-1.5"
        style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex justify-between text-xs">
          <span style={{ color: 'var(--text-muted)' }}>Synced sermons</span>
          <span style={{ color: 'var(--text-primary)' }}>{syncStatus.synced}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: 'var(--text-muted)' }}>Pending sync</span>
          <span style={{ color: syncStatus.needsSync > 0 ? '#f59e0b' : 'var(--text-primary)' }}>{syncStatus.needsSync}</span>
        </div>
        {syncStatus.lastSync && (
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--text-muted)' }}>Last synced</span>
            <span style={{ color: 'var(--text-primary)' }}>{new Date(syncStatus.lastSync).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => syncNow()}
          disabled={syncStatus.inProgress}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-[var(--radius-md)] text-sm font-medium text-white disabled:opacity-50 transition-colors"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          <RefreshCw size={14} className={syncStatus.inProgress ? 'animate-spin' : ''} />
          {syncStatus.inProgress ? 'Syncing…' : 'Sync Now'}
        </button>
        <button
          onClick={() => uploadAllToCloud()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-[var(--radius-md)] text-sm font-medium border transition-colors hover:bg-[var(--surface-hover)]"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        >
          <CloudUpload size={14} /> Upload All
        </button>
      </div>

      <button
        onClick={logout}
        className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-[var(--radius-md)] text-sm font-medium border transition-colors"
        style={{ borderColor: '#dc2626', color: '#dc2626' }}
      >
        <LogOut size={14} /> Sign Out
      </button>
    </div>
  ) : (
    <div className="space-y-4 max-w-md">
      <div
        className="flex rounded-[var(--radius-md)] overflow-hidden border"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {(['login', 'register'] as AuthTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setAuthTab(tab); setAuthError('') }}
            className="flex-1 h-9 text-sm font-medium capitalize transition-colors"
            style={{
              backgroundColor: authTab === tab ? 'var(--accent-primary)' : 'transparent',
              color: authTab === tab ? '#fff' : 'var(--text-muted)',
            }}
          >
            {tab === 'login' ? 'Sign In' : 'Register'}
          </button>
        ))}
      </div>

      {authTab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email" autoComplete="email"
            value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="Email" required
            className="w-full px-3 h-9 rounded-[var(--radius-md)] border text-sm bg-transparent"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
          />
          <input
            type="password" autoComplete="current-password"
            value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Password" required
            className="w-full px-3 h-9 rounded-[var(--radius-md)] border text-sm bg-transparent"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
          />
          {authError && <p className="text-xs" style={{ color: '#dc2626' }}>{authError}</p>}
          <button
            type="submit" disabled={authLoading}
            className="w-full h-9 rounded-[var(--radius-md)] text-sm font-medium text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            {authLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-3">
          <input
            type="text" autoComplete="name"
            value={regName} onChange={(e) => setRegName(e.target.value)}
            placeholder="Your name" required
            className="w-full px-3 h-9 rounded-[var(--radius-md)] border text-sm bg-transparent"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
          />
          <input
            type="email" autoComplete="email"
            value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
            placeholder="Email" required
            className="w-full px-3 h-9 rounded-[var(--radius-md)] border text-sm bg-transparent"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
          />
          <input
            type="password" autoComplete="new-password"
            value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
            placeholder="Password" required
            className="w-full px-3 h-9 rounded-[var(--radius-md)] border text-sm bg-transparent"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
          />
          {authError && <p className="text-xs" style={{ color: '#dc2626' }}>{authError}</p>}
          <button
            type="submit" disabled={authLoading}
            className="w-full h-9 rounded-[var(--radius-md)] text-sm font-medium text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            {authLoading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      )}
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Sign in to sync your sermons across devices.
      </p>
    </div>
  )

  /* ─── Mobile section card wrapper ─── */
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  )

  const mobileHeader = (
    <div className="px-4 py-3 md:hidden">
      <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
    </div>
  )

  return (
    <AppShell header={mobileHeader} fullBleed>
      {/* ─── MOBILE (< md) — original stacked sections ─── */}
      <div className="md:hidden max-w-2xl mx-auto py-4 px-4 space-y-4 pb-20">
        <Section title="Appearance">{AppearanceContent}</Section>
        <Section title="Data Management">{DataContent}</Section>
        <Section title="Cloud Sync & Account">{AccountContent}</Section>
      </div>

      {/* ─── DESKTOP (≥ md) — section nav + active section pane ─── */}
      <div className="hidden md:flex h-[calc(100dvh-env(safe-area-inset-top))]">
        {/* Section nav */}
        <aside
          className="w-[240px] flex-shrink-0 border-r overflow-y-auto"
          style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="px-5 h-14 flex items-center border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <h1 className="text-base font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Settings
            </h1>
          </div>
          <nav className="p-2 space-y-0.5">
            {SECTIONS.map(({ key, label, icon: Icon }) => {
              const active = activeSection === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className="w-full text-left flex items-center gap-2.5 h-9 px-3 rounded-[var(--radius-md)] text-sm transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--surface)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  <Icon
                    size={15}
                    className={active ? 'text-[var(--accent-primary)]' : ''}
                  />
                  {label}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Active section content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl px-8 py-8">
            {SECTIONS.filter(({ key }) => key === activeSection).map(({ key, label, description }) => (
              <header key={key} className="mb-7">
                <h2
                  className="text-xl font-semibold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {label}
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {description}
                </p>
              </header>
            ))}

            {activeSection === 'appearance' && AppearanceContent}
            {activeSection === 'data' && DataContent}
            {activeSection === 'account' && AccountContent}
          </div>
        </main>
      </div>

      <ConfirmModal
        open={showClearCache}
        title="Clear Bible Cache"
        message="This will remove all cached Bible chapters. They'll be re-fetched when needed."
        confirmLabel="Clear Cache"
        onConfirm={handleClearCache}
        onCancel={() => setShowClearCache(false)}
      />
      <ConfirmModal
        open={showClearData}
        title="Clear All Data"
        message="This will permanently delete all sermons, settings, and cached data. This cannot be undone."
        confirmLabel="Delete Everything"
        danger
        onConfirm={handleClearData}
        onCancel={() => setShowClearData(false)}
      />
    </AppShell>
  )
}
