'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  PenLine, BookOpen, Library, Calendar, Settings, ChevronRight,
  Clock, Edit, Trash2, BarChart3, BookMarked, Plus, ArrowRight, CalendarDays,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { ConfirmModal } from '@/components/ui/Modal'
import { useSermonStore } from '@/store/sermonStore'
import { formatDate } from '@/lib/utils'
import type { Sermon } from '@/types'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getThisMonthCount(sermons: Sermon[]): number {
  const now = new Date()
  return sermons.filter((s) => {
    const d = new Date(s.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
}

function getNextUpcoming(sermons: Sermon[], n = 4): Sermon[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return sermons
    .filter((s) => new Date(s.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, n)
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diffMs / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function HomePage() {
  const router = useRouter()
  const { sermons, editingSermonId, deleteSermon, setEditingSermonId, loadSermons } = useSermonStore()
  const [deleteTarget, setDeleteTarget] = useState<Sermon | null>(null)

  useEffect(() => {
    loadSermons()
    const seen = localStorage.getItem('hasSeenWelcome')
    if (!seen) router.replace('/welcome')
  }, [loadSermons, router])

  const recent = [...sermons].sort((a, b) => b.lastModified.localeCompare(a.lastModified)).slice(0, 5)
  const editingSermon = editingSermonId ? sermons.find((s) => s.id === editingSermonId) : null
  const monthCount = getThisMonthCount(sermons)
  const upcoming = getNextUpcoming(sermons, 4)
  const nextSermon = upcoming[0]

  const handleEdit = (s: Sermon) => {
    setEditingSermonId(s.id)
    router.push('/builder')
  }

  const handleNew = () => {
    setEditingSermonId(null)
    router.push('/builder')
  }

  const confirmDelete = () => {
    if (deleteTarget) { deleteSermon(deleteTarget.id); setDeleteTarget(null) }
  }

  const quickLinks = [
    { href: '/builder', label: 'Sermon Builder', icon: PenLine, badge: null },
    { href: '/library', label: 'Library', icon: Library, badge: sermons.length || null },
    { href: '/bible', label: 'Bible Reader', icon: BookOpen, badge: null },
    { href: '/calendar', label: 'Calendar', icon: Calendar, badge: null },
    { href: '/settings', label: 'Settings', icon: Settings, badge: null },
    { href: '#', label: 'Statistics', icon: BarChart3, badge: null, disabled: true },
  ]

  return (
    <AppShell>
      {/* ─── MOBILE (< md) ────────────────────────────────────────── */}
      <div className="md:hidden max-w-2xl mx-auto py-6 space-y-6">
        <section>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {getGreeting()} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {sermons.length} sermon{sermons.length !== 1 ? 's' : ''} · {monthCount} this month
          </p>
        </section>

        {editingSermon && (
          <section
            className="rounded-xl p-4 flex items-center justify-between gap-3"
            style={{ backgroundColor: 'var(--verse-bg)', borderLeft: '3px solid var(--accent-primary)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Clock size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--accent-primary)' }}>
                  Sermon in progress
                </p>
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {editingSermon.title || 'Untitled'}
                </p>
              </div>
            </div>
            <Link
              href="/builder"
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Continue
            </Link>
          </section>
        )}

        <section>
          <Link
            href="/builder"
            className="flex items-center justify-between p-5 rounded-2xl text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Start here</p>
              <p className="text-xl font-bold mt-0.5">Create New Sermon</p>
            </div>
            <PenLine size={32} opacity={0.8} />
          </Link>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
            Quick Access
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {quickLinks.map(({ href, label, icon: Icon, badge, disabled }) => (
              <Link
                key={label}
                href={disabled ? '#' : href}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-opacity ${disabled ? 'opacity-40 pointer-events-none' : 'hover:opacity-80'}`}
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <Icon size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>{label}</span>
                {badge !== null && (
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Recent Sermons
            </h2>
            <Link href="/library" className="text-xs font-medium flex items-center gap-0.5" style={{ color: 'var(--accent-primary)' }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="text-center py-10 rounded-xl border border-dashed" style={{ borderColor: 'var(--border-color)' }}>
              <BookMarked size={32} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No sermons yet. Create your first one!</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {recent.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {s.title || 'Untitled'}
                    </p>
                    <p className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <span>{formatDate(s.date)}</span>
                      {s.speaker && <span>· {s.speaker}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-2 rounded-lg"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label="Edit"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="p-2 rounded-lg"
                      style={{ color: '#dc2626' }}
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ─── DESKTOP (≥ md) ───────────────────────────────────────── */}
      <div className="hidden md:block max-w-7xl mx-auto py-8 px-2 lg:px-4">
        {/* Header row */}
        <header className="flex items-end justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {getGreeting()}, Chris
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {sermons.length} sermon{sermons.length !== 1 ? 's' : ''} · {monthCount} this month
            </p>
          </div>
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[var(--radius-md)] text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Plus size={16} /> New Sermon
          </button>
        </header>

        {/* Top cards: In Progress + This Sunday */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* In Progress */}
          <div
            className="rounded-[var(--radius-lg)] p-5 border flex flex-col"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} style={{ color: 'var(--accent-primary)' }} />
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: 'var(--text-muted)' }}
              >
                In Progress
              </p>
            </div>
            {editingSermon ? (
              <>
                <p
                  className="text-lg font-semibold tracking-tight truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {editingSermon.title || 'Untitled'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Edited {relativeTime(editingSermon.lastModified)}
                  {editingSermon.speaker && ` · ${editingSermon.speaker}`}
                </p>
                <div className="mt-auto pt-4">
                  <Link
                    href="/builder"
                    className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Continue editing <ArrowRight size={14} />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Nothing in progress.
                </p>
                <div className="mt-auto pt-4">
                  <button
                    onClick={handleNew}
                    className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Start a new sermon <ArrowRight size={14} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* This Sunday / next upcoming */}
          <div
            className="rounded-[var(--radius-lg)] p-5 border flex flex-col"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={14} style={{ color: 'var(--accent-primary)' }} />
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: 'var(--text-muted)' }}
              >
                Next Up
              </p>
            </div>
            {nextSermon ? (
              <>
                <p
                  className="text-lg font-semibold tracking-tight truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {nextSermon.title || 'Untitled'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(nextSermon.date)}
                  {nextSermon.verseReference && ` · ${nextSermon.verseReference}`}
                </p>
                <div className="mt-auto pt-4">
                  <button
                    onClick={() => handleEdit(nextSermon)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Open in Builder <ArrowRight size={14} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No upcoming sermons scheduled.
                </p>
                <div className="mt-auto pt-4">
                  <Link
                    href="/calendar"
                    className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Open Calendar <ArrowRight size={14} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom row: Recent table + Upcoming side card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent (table) */}
          <section
            className="lg:col-span-2 rounded-[var(--radius-lg)] border overflow-hidden"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)' }}
          >
            <header className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Recent sermons
              </h2>
              <Link
                href="/library"
                className="text-xs font-medium flex items-center gap-0.5 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                View all <ChevronRight size={12} />
              </Link>
            </header>

            {recent.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <BookMarked size={28} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No sermons yet.
                </p>
                <button
                  onClick={handleNew}
                  className="mt-3 text-sm font-medium"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Create your first one →
                </button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-[11px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <th className="text-left px-5 py-2 font-semibold">Title</th>
                    <th className="text-left px-3 py-2 font-semibold w-32">Date</th>
                    <th className="text-left px-3 py-2 font-semibold w-40">Speaker</th>
                    <th className="w-20" />
                  </tr>
                </thead>
                <tbody>
                  {recent.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => handleEdit(s)}
                      className="group border-t cursor-pointer transition-colors hover:bg-[var(--surface-hover)]"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <td className="px-5 py-2.5">
                        <span
                          className="font-medium truncate block"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {s.title || 'Untitled'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(s.date)}
                      </td>
                      <td className="px-3 py-2.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                        {s.speaker || '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(s) }}
                            className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--surface)]"
                            style={{ color: 'var(--text-muted)' }}
                            aria-label="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(s) }}
                            className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--surface)]"
                            style={{ color: '#dc2626' }}
                            aria-label="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Upcoming side card */}
          <aside
            className="rounded-[var(--radius-lg)] border overflow-hidden flex flex-col"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)' }}
          >
            <header className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Upcoming
              </h2>
              <Link
                href="/calendar"
                className="text-xs font-medium flex items-center gap-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Calendar <ChevronRight size={12} />
              </Link>
            </header>

            {upcoming.length === 0 ? (
              <div className="px-5 py-10 text-center flex-1 flex flex-col justify-center">
                <CalendarDays size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Nothing scheduled.
                </p>
              </div>
            ) : (
              <ul className="flex-1">
                {upcoming.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => handleEdit(s)}
                    className="px-5 py-3 border-t cursor-pointer transition-colors hover:bg-[var(--surface-hover)]"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-0.5"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {formatDate(s.date)}
                    </p>
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {s.title || 'Untitled'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Sermon"
        message={`Delete "${deleteTarget?.title || 'this sermon'}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  )
}
