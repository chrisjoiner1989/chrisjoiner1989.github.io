'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Eye, Edit2, Trash2, CalendarDays, BookMarked, X, ChevronDown } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { useSermonStore } from '@/store/sermonStore'
import { search, highlight } from '@/lib/searchEngine'
import { getTagColor } from '@/lib/tagSystem'
import { exportAllSermons } from '@/lib/calendarExport'
import { formatDate } from '@/lib/utils'
import type { Sermon } from '@/types'

type SortKey = 'newest' | 'oldest' | 'title'

/** Safe React-only highlighter — splits on <mark> tags from highlight() and renders. */
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>
  const html = highlight(text, query)
  // highlight() wraps matches in <mark class="search-highlight">…</mark>
  const parts = html.split(/(<mark class="search-highlight">[^<]*<\/mark>)/g)
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^<mark class="search-highlight">([^<]*)<\/mark>$/)
        if (m) return <mark key={i} className="search-highlight">{m[1]}</mark>
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

export default function LibraryPage() {
  const router = useRouter()
  const { sermons, deleteSermon, setEditingSermonId } = useSermonStore()

  const [query, setQuery] = useState('')
  const [speakerFilter, setSpeakerFilter] = useState('')
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const [sort, setSort] = useState<SortKey>('newest')
  const [viewSermon, setViewSermon] = useState<Sermon | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Sermon | null>(null)

  const speakers = useMemo(() => [...new Set(sermons.map((s) => s.speaker).filter(Boolean))].sort(), [sermons])
  const allTags = useMemo(
    () => [...new Set(sermons.flatMap((s) => s.tags ?? []))].sort(),
    [sermons],
  )

  const filtered = useMemo(() => {
    let list = query.trim() ? search(sermons, query) : [...sermons]
    if (speakerFilter) list = list.filter((s) => s.speaker === speakerFilter)
    if (tagFilter.length) list = list.filter((s) => tagFilter.every((t) => s.tags?.includes(t)))
    if (!query.trim()) {
      list.sort((a, b) => {
        if (sort === 'newest') return b.date.localeCompare(a.date)
        if (sort === 'oldest') return a.date.localeCompare(b.date)
        return a.title.localeCompare(b.title)
      })
    }
    return list
  }, [sermons, query, speakerFilter, tagFilter, sort])

  const selected = filtered.find((s) => s.id === selectedId) ?? filtered[0] ?? null

  const handleEdit = (s: Sermon) => {
    setEditingSermonId(s.id)
    router.push('/builder')
  }

  const toggleTag = (tag: string) =>
    setTagFilter((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))

  /* ─── MOBILE header (kept identical to original) ─── */
  const mobileHeader = (
    <div className="px-4 py-3 space-y-2 md:hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Library</h1>
        <button
          onClick={() => exportAllSermons(sermons)}
          className="p-2 rounded-lg"
          style={{ color: 'var(--text-muted)' }}
          title="Export to calendar"
        >
          <CalendarDays size={18} />
        </button>
      </div>
      <div className="flex gap-2">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        >
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sermons…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <select
          value={speakerFilter}
          onChange={(e) => setSpeakerFilter(e.target.value)}
          className="flex-1 px-3 py-1.5 rounded-lg border text-xs bg-transparent"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        >
          <option value="">All speakers</option>
          {speakers.map((sp) => <option key={sp} value={sp}>{sp}</option>)}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="flex-1 px-3 py-1.5 rounded-lg border text-xs bg-transparent"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">By title</option>
        </select>
      </div>
    </div>
  )

  return (
    <AppShell header={mobileHeader} fullBleed>
      {/* ─── MOBILE (< md) — original card list + view modal ─── */}
      <div className="md:hidden max-w-2xl mx-auto py-3 px-4 space-y-2 pb-20">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} sermon{filtered.length !== 1 ? 's' : ''}{query ? ` for "${query}"` : ''}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookMarked size={36} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {query ? 'No results found.' : 'No sermons yet.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border p-4 space-y-2"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      <HighlightedText text={s.title || 'Untitled'} query={query} />
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(s.date)}{s.speaker ? ` · ${s.speaker}` : ''}{s.series ? ` · ${s.series}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setViewSermon(s)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }} aria-label="View">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg" style={{ color: 'var(--accent-primary)' }} aria-label="Edit">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-lg" style={{ color: '#dc2626' }} aria-label="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {s.verseReference && (
                  <p className="text-xs italic" style={{ color: 'var(--accent-primary)' }}>{s.verseReference}</p>
                )}

                {s.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getTagColor(tag) }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {query && s.notes && (
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    <HighlightedText text={s.notes} query={query} />
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ─── DESKTOP (≥ md) — filter rail + list + detail pane ─── */}
      <div className="hidden md:flex h-[calc(100dvh-env(safe-area-inset-top))]">
        {/* Filter rail */}
        <aside
          className="hidden lg:flex flex-col w-[220px] flex-shrink-0 border-r overflow-y-auto"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-sunken)' }}
        >
          <div className="px-4 py-4 space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: 'var(--text-muted)' }}>
                Search
              </p>
              <div
                className="flex items-center gap-2 px-2.5 h-8 rounded-[var(--radius-md)] border"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)' }}
              >
                <Search size={13} style={{ color: 'var(--text-muted)' }} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                {query && (
                  <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }} aria-label="Clear">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: 'var(--text-muted)' }}>
                Speaker
              </p>
              <div className="relative">
                <select
                  value={speakerFilter}
                  onChange={(e) => setSpeakerFilter(e.target.value)}
                  className="w-full appearance-none px-2.5 h-8 pr-7 rounded-[var(--radius-md)] border text-sm bg-transparent"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
                >
                  <option value="">All speakers</option>
                  {speakers.map((sp) => <option key={sp} value={sp}>{sp}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: 'var(--text-muted)' }}>
                Sort
              </p>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="w-full appearance-none px-2.5 h-8 pr-7 rounded-[var(--radius-md)] border text-sm bg-transparent"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title">By title</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>

            {allTags.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
                    Tags
                  </p>
                  {tagFilter.length > 0 && (
                    <button
                      onClick={() => setTagFilter([])}
                      className="text-[10px] font-medium"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {allTags.map((tag) => {
                    const active = tagFilter.includes(tag)
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors"
                        style={{
                          backgroundColor: active ? getTagColor(tag) : 'var(--surface)',
                          color: active ? '#fff' : 'var(--text-secondary)',
                          border: `1px solid ${active ? getTagColor(tag) : 'var(--border-color)'}`,
                        }}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                onClick={() => exportAllSermons(sermons)}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <CalendarDays size={13} /> Export all
              </button>
            </div>

            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} of {sermons.length}
            </p>
          </div>
        </aside>

        {/* Sermon list */}
        <section
          className="w-[300px] lg:w-[320px] flex-shrink-0 border-r overflow-y-auto"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {/* Tablet-only filter bar (lg:hidden) */}
          <div
            className="lg:hidden sticky top-0 z-10 px-3 py-2 space-y-2 border-b"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border-subtle)',
              paddingTop: 'env(safe-area-inset-top)',
            }}
          >
            <div className="flex items-center justify-between">
              <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Library</h1>
              <button
                onClick={() => exportAllSermons(sermons)}
                className="p-1.5 rounded-[var(--radius-md)]"
                style={{ color: 'var(--text-muted)' }}
                title="Export all"
              >
                <CalendarDays size={14} />
              </button>
            </div>
            <div
              className="flex items-center gap-2 px-2.5 h-8 rounded-[var(--radius-md)] border"
              style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-color)' }}
            >
              <Search size={13} style={{ color: 'var(--text-muted)' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }} aria-label="Clear">
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={speakerFilter}
                onChange={(e) => setSpeakerFilter(e.target.value)}
                className="flex-1 h-7 px-2 rounded-[var(--radius-md)] border text-xs bg-transparent"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option value="">All speakers</option>
                {speakers.map((sp) => <option key={sp} value={sp}>{sp}</option>)}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="flex-1 h-7 px-2 rounded-[var(--radius-md)] border text-xs bg-transparent"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>

          {/* Desktop list header */}
          <div
            className="hidden lg:flex items-center justify-between px-4 h-12 border-b sticky top-0 z-10"
            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-subtle)' }}
          >
            <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Library</h1>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 px-4">
              <BookMarked size={28} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {query ? 'No results found.' : 'No sermons yet.'}
              </p>
            </div>
          ) : (
            <ul>
              {filtered.map((s) => {
                const active = selected?.id === s.id
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelectedId(s.id)}
                      className="w-full text-left px-4 py-3 border-b transition-colors relative"
                      style={{
                        borderColor: 'var(--border-subtle)',
                        backgroundColor: active ? 'var(--surface-hover)' : 'transparent',
                      }}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-full"
                          style={{ backgroundColor: 'var(--accent-primary)' }}
                          aria-hidden
                        />
                      )}
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <HighlightedText text={s.title || 'Untitled'} query={query} />
                      </p>
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(s.date)}{s.speaker ? ` · ${s.speaker}` : ''}
                      </p>
                      {s.tags && s.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {s.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-px rounded-full text-[10px] font-medium text-white"
                              style={{ backgroundColor: getTagColor(tag) }}
                            >
                              {tag}
                            </span>
                          ))}
                          {s.tags.length > 3 && (
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>+{s.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Detail pane */}
        <main className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center px-6 py-16 text-center">
              <BookMarked size={32} className="mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {sermons.length === 0 ? 'No sermons yet.' : 'Select a sermon to see details.'}
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-8 py-8">
              {/* Detail header */}
              <header className="flex items-start justify-between gap-4 mb-6">
                <div className="min-w-0">
                  <h2
                    className="text-2xl font-semibold tracking-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {selected.title || 'Untitled'}
                  </h2>
                  <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(selected.date)}
                    {selected.speaker && ` · ${selected.speaker}`}
                    {selected.series && ` · ${selected.series}`}
                  </p>
                  {selected.verseReference && (
                    <p className="text-sm font-medium mt-1.5" style={{ color: 'var(--accent-primary)' }}>
                      {selected.verseReference}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(selected)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(selected)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] transition-colors hover:bg-[var(--surface-hover)]"
                    style={{ color: '#dc2626' }}
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </header>

              {selected.tags && selected.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {selected.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getTagColor(tag) }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {selected.notes && (
                <section className="mb-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: 'var(--text-muted)' }}>
                    Notes
                  </p>
                  <p className="text-[15px] whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    <HighlightedText text={selected.notes} query={query} />
                  </p>
                </section>
              )}

              {selected.sections && selected.sections.length > 0 && (
                <section>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: 'var(--text-muted)' }}>
                    Outline · {selected.sections.length} section{selected.sections.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-3">
                    {selected.sections.map((section, i) => (
                      <article
                        key={section.id}
                        className="rounded-[var(--radius-lg)] border p-4"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)' }}
                      >
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {i + 1}. {section.heading || 'Untitled section'}
                        </p>
                        {section.scripture && (
                          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--accent-primary)' }}>
                            {section.scripture}
                          </p>
                        )}
                        {section.notes && (
                          <p className="text-sm mt-2 whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {section.notes}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile-only view modal */}
      <Modal open={!!viewSermon} onClose={() => setViewSermon(null)} title={viewSermon?.title || 'Sermon'} size="lg">
        {viewSermon && (
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {formatDate(viewSermon.date)}{viewSermon.speaker ? ` · ${viewSermon.speaker}` : ''}
              </p>
              {viewSermon.series && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Series: {viewSermon.series}</p>}
              {viewSermon.verseReference && (
                <p className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>{viewSermon.verseReference}</p>
              )}
            </div>

            {viewSermon.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {viewSermon.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: getTagColor(tag) }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {viewSermon.notes && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Notes</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{viewSermon.notes}</p>
              </div>
            )}

            {viewSermon.sections?.map((section, i) => (
              <div key={section.id} className="rounded-lg border p-3 space-y-1" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {i + 1}. {section.heading}
                </p>
                {section.scripture && <p className="text-xs italic" style={{ color: 'var(--accent-primary)' }}>{section.scripture}</p>}
                {section.notes && <p className="text-sm whitespace-pre-wrap mt-1" style={{ color: 'var(--text-secondary)' }}>{section.notes}</p>}
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setViewSermon(null); handleEdit(viewSermon) }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                Edit Sermon
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Sermon"
        message={`Delete "${deleteTarget?.title || 'this sermon'}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteTarget) {
            deleteSermon(deleteTarget.id)
            if (selectedId === deleteTarget.id) setSelectedId(null)
            setDeleteTarget(null)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  )
}
