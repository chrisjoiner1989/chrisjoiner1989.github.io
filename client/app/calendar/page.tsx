'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, CalendarDays, Download, Edit2, Trash2, Plus } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { ConfirmModal } from '@/components/ui/Modal'
import { useSermonStore } from '@/store/sermonStore'
import { exportAllSermons, exportUpcomingSermons } from '@/lib/calendarExport'
import { formatDate } from '@/lib/utils'
import { getTagColor } from '@/lib/tagSystem'
import type { Sermon } from '@/types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

interface DragState {
  sermon: Sermon
  fromDate: string
}

export default function CalendarPage() {
  const router = useRouter()
  const { sermons, updateSermon, deleteSermon, setEditingSermonId } = useSermonStore()
  const [current, setCurrent] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [pendingMove, setPendingMove] = useState<{ sermon: Sermon; toDate: string } | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Sermon | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const prevMonth = () => setCurrent((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 })
  const nextMonth = () => setCurrent((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 })
  const goToToday = () => {
    const now = new Date()
    setCurrent({ year: now.getFullYear(), month: now.getMonth() })
    setSelectedDate(today)
  }

  const days = useMemo(() => {
    const firstDay = new Date(current.year, current.month, 1).getDay()
    const daysInMonth = new Date(current.year, current.month + 1, 0).getDate()
    const daysInPrevMonth = new Date(current.year, current.month, 0).getDate()
    const cells: { date: string; isCurrentMonth: boolean }[] = []

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const m = current.month === 0 ? 11 : current.month - 1
      const y = current.month === 0 ? current.year - 1 : current.year
      cells.push({ date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: false })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: true })
    }
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
      const m = current.month === 11 ? 0 : current.month + 1
      const y = current.month === 11 ? current.year + 1 : current.year
      cells.push({ date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: false })
    }
    return cells
  }, [current])

  const sermonsByDate = useMemo(() => {
    const map: Record<string, Sermon[]> = {}
    sermons.forEach((s) => {
      if (!map[s.date]) map[s.date] = []
      map[s.date].push(s)
    })
    return map
  }, [sermons])

  const handleDrop = (toDate: string) => {
    if (!dragState || dragState.fromDate === toDate) { setDragState(null); return }
    const daysDiff = Math.abs((new Date(toDate).getTime() - new Date(dragState.fromDate).getTime()) / 86400000)
    if (daysDiff > 7) {
      setPendingMove({ sermon: dragState.sermon, toDate })
    } else {
      updateSermon(dragState.sermon.id, { date: toDate })
    }
    setDragState(null)
  }

  const confirmMove = () => {
    if (pendingMove) { updateSermon(pendingMove.sermon.id, { date: pendingMove.toDate }); setPendingMove(null) }
  }

  const handleEdit = (s: Sermon) => {
    setEditingSermonId(s.id)
    router.push('/builder')
  }

  const handleNewOnDate = (date: string) => {
    setEditingSermonId(null)
    localStorage.setItem('currentSermon', JSON.stringify({ date }))
    router.push('/builder')
  }

  const selectedSermons = selectedDate ? (sermonsByDate[selectedDate] ?? []) : []
  const monthSermonCount = useMemo(() => {
    const prefix = `${current.year}-${String(current.month + 1).padStart(2, '0')}`
    return sermons.filter((s) => s.date.startsWith(prefix)).length
  }, [sermons, current])

  /* ─── MOBILE header ─── */
  const mobileHeader = (
    <div className="px-4 py-3 md:hidden">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {MONTHS[current.month]} {current.year}
          </h1>
          <button onClick={nextMonth} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => exportUpcomingSermons(sermons)} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }} title="Export upcoming">
            <CalendarDays size={16} />
          </button>
          <button onClick={() => exportAllSermons(sermons)} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }} title="Export all">
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <AppShell header={mobileHeader} fullBleed>
      {/* ─── MOBILE (< md) — original grid ─── */}
      <div className="md:hidden pb-20">
        <div
          className="grid grid-cols-7 border-b"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
        >
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map(({ date, isCurrentMonth }) => {
            const daySermons = sermonsByDate[date] || []
            const isToday = date === today
            const dayNum = parseInt(date.split('-')[2])
            return (
              <div
                key={date}
                className="min-h-[72px] border-b border-r p-1 relative"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: isCurrentMonth ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                  opacity: isCurrentMonth ? 1 : 0.5,
                }}
                onDragOver={(e) => { e.preventDefault() }}
                onDrop={() => handleDrop(date)}
              >
                <div
                  className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'text-white' : ''}`}
                  style={isToday ? { backgroundColor: 'var(--accent-primary)' } : { color: 'var(--text-muted)' }}
                >
                  {dayNum}
                </div>
                <div className="space-y-0.5">
                  {daySermons.slice(0, 2).map((s) => (
                    <div
                      key={s.id}
                      draggable
                      onDragStart={() => setDragState({ sermon: s, fromDate: date })}
                      className="truncate text-[10px] font-medium px-1 py-0.5 rounded text-white cursor-grab active:cursor-grabbing"
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                      title={s.title}
                    >
                      {s.title || 'Untitled'}
                    </div>
                  ))}
                  {daySermons.length > 2 && (
                    <div className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
                      +{daySermons.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── DESKTOP (≥ md) — month grid + day detail panel ─── */}
      <div className="hidden md:flex flex-col h-[calc(100dvh-env(safe-area-inset-top))]">
        {/* Sticky header */}
        <header
          className="flex items-center justify-between px-5 h-14 border-b flex-shrink-0"
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {MONTHS[current.month]} {current.year}
            </h1>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {monthSermonCount} sermon{monthSermonCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] transition-colors hover:bg-[var(--surface-hover)]"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToToday}
              className="h-8 px-3 rounded-[var(--radius-md)] text-xs font-medium border transition-colors hover:bg-[var(--surface-hover)]"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] transition-colors hover:bg-[var(--surface-hover)]"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
            <span className="w-px h-5 mx-1.5" style={{ backgroundColor: 'var(--border-color)' }} />
            <button
              onClick={() => exportUpcomingSermons(sermons)}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[var(--radius-md)] text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
              style={{ color: 'var(--text-secondary)' }}
              title="Export upcoming"
            >
              <CalendarDays size={13} /> Upcoming
            </button>
            <button
              onClick={() => exportAllSermons(sermons)}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[var(--radius-md)] text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
              style={{ color: 'var(--text-secondary)' }}
              title="Export all"
            >
              <Download size={13} /> Export
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Month grid */}
          <section className="flex-1 flex flex-col overflow-hidden">
            {/* Day labels */}
            <div
              className="grid grid-cols-7 border-b flex-shrink-0"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid cells */}
            <div className="grid grid-cols-7 flex-1 overflow-y-auto">
              {days.map(({ date, isCurrentMonth }) => {
                const daySermons = sermonsByDate[date] || []
                const isToday = date === today
                const isSelected = selectedDate === date
                const dayNum = parseInt(date.split('-')[2])
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    onDragOver={(e) => { e.preventDefault() }}
                    onDrop={() => handleDrop(date)}
                    className="text-left p-2 border-b border-r relative transition-colors min-h-[110px] flex flex-col"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: isSelected
                        ? 'var(--surface-hover)'
                        : isCurrentMonth
                          ? 'var(--bg-primary)'
                          : 'var(--surface-sunken)',
                      color: isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                      boxShadow: isSelected ? `inset 0 0 0 1px var(--accent-primary)` : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday ? 'text-white' : ''}`}
                        style={isToday ? { backgroundColor: 'var(--accent-primary)' } : {}}
                      >
                        {dayNum}
                      </span>
                      {daySermons.length > 0 && (
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {daySermons.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      {daySermons.slice(0, 3).map((s) => (
                        <div
                          key={s.id}
                          draggable
                          onDragStart={(e) => { e.stopPropagation(); setDragState({ sermon: s, fromDate: date }) }}
                          onClick={(e) => { e.stopPropagation(); setSelectedDate(date) }}
                          className="text-[11px] font-medium px-1.5 py-0.5 rounded text-white cursor-grab active:cursor-grabbing truncate"
                          style={{ backgroundColor: 'var(--accent-primary)' }}
                          title={s.title}
                        >
                          {s.title || 'Untitled'}
                        </div>
                      ))}
                      {daySermons.length > 3 && (
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          +{daySermons.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Detail panel */}
          <aside
            className="hidden lg:flex flex-col w-[320px] flex-shrink-0 border-l overflow-y-auto"
            style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-subtle)' }}
          >
            {!selectedDate ? (
              <div className="h-full flex flex-col items-center justify-center px-6 text-center">
                <CalendarDays size={28} className="mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Select a day to see its sermons.
                </p>
              </div>
            ) : (
              <>
                <header className="px-4 h-12 flex items-center justify-between border-b flex-shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {selectedDate === today ? 'Today' : ''}
                    </p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(selectedDate)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNewOnDate(selectedDate)}
                    className="inline-flex items-center gap-1 h-7 px-2 rounded-[var(--radius-md)] text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
                    style={{ color: 'var(--accent-primary)' }}
                    title="New sermon on this day"
                  >
                    <Plus size={12} /> New
                  </button>
                </header>

                {selectedSermons.length === 0 ? (
                  <div className="px-5 py-10 text-center flex-1 flex flex-col justify-center">
                    <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                      No sermon scheduled.
                    </p>
                    <button
                      onClick={() => handleNewOnDate(selectedDate)}
                      className="inline-flex items-center justify-center gap-1.5 h-8 px-3 mx-auto rounded-[var(--radius-md)] text-xs font-medium text-white"
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                    >
                      <Plus size={13} /> Schedule a sermon
                    </button>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {selectedSermons.map((s) => (
                      <article
                        key={s.id}
                        className="rounded-[var(--radius-lg)] border p-3"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)' }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-sm font-semibold tracking-tight"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {s.title || 'Untitled'}
                            </p>
                            {s.speaker && (
                              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                {s.speaker}{s.series ? ` · ${s.series}` : ''}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button
                              onClick={() => handleEdit(s)}
                              className="p-1.5 rounded-[var(--radius-sm)] transition-colors hover:bg-[var(--surface-hover)]"
                              style={{ color: 'var(--text-muted)' }}
                              aria-label="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(s)}
                              className="p-1.5 rounded-[var(--radius-sm)] transition-colors hover:bg-[var(--surface-hover)]"
                              style={{ color: '#dc2626' }}
                              aria-label="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {s.verseReference && (
                          <p className="text-xs font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>
                            {s.verseReference}
                          </p>
                        )}

                        {s.tags && s.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {s.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-px rounded-full text-[10px] font-medium text-white"
                                style={{ backgroundColor: getTagColor(tag) }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {s.notes && (
                          <p className="text-xs leading-relaxed line-clamp-4 mt-2" style={{ color: 'var(--text-secondary)' }}>
                            {s.notes}
                          </p>
                        )}

                        <button
                          onClick={() => handleEdit(s)}
                          className="mt-3 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          Open in Builder <ChevronRight size={12} />
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      </div>

      <ConfirmModal
        open={!!pendingMove}
        title="Move Sermon"
        message={`Move "${pendingMove?.sermon.title || 'this sermon'}" to ${pendingMove ? formatDate(pendingMove.toDate) : ''}? This is more than 7 days away.`}
        confirmLabel="Move"
        onConfirm={confirmMove}
        onCancel={() => setPendingMove(null)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Sermon"
        message={`Delete "${deleteTarget?.title || 'this sermon'}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => { if (deleteTarget) { deleteSermon(deleteTarget.id); setDeleteTarget(null) } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  )
}
