'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Save, Play, Trash2, Presentation, Download,
  Search, Check, LayoutTemplate, ChevronRight, Type as TypeIcon,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { TagInput } from '@/components/ui/TagInput'
import { ConfirmModal } from '@/components/ui/Modal'
import { SermonSectionCard } from '@/components/builder/SermonSection'
import { TemplatePickerModal } from '@/components/builder/TemplatePickerModal'
import { useSermonStore } from '@/store/sermonStore'
import { fetchVerse } from '@/lib/bibleApi'
import { generateId, getTodayString, validateVerseFormat } from '@/lib/utils'
import type { SermonSection, SermonTemplate } from '@/types'

type AutoSaveState = 'idle' | 'saving' | 'saved'
type DesktopTab = 'sections' | 'meta'

const CURRENT_KEY = 'currentSermon'

export default function BuilderPage() {
  const router = useRouter()
  const { sermons, editingSermonId, saveSermon, setEditingSermonId } = useSermonStore()

  const [title, setTitle] = useState('')
  const [speaker, setSpeaker] = useState('')
  const [date, setDate] = useState(getTodayString())
  const [series, setSeries] = useState('')
  const [verseRef, setVerseRef] = useState('')
  const [verseText, setVerseText] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [sections, setSections] = useState<SermonSection[]>([])

  const [verseLoading, setVerseLoading] = useState(false)
  const [verseError, setVerseError] = useState('')
  const [autoSave, setAutoSave] = useState<AutoSaveState>('idle')
  const [showTemplate, setShowTemplate] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Desktop-only state
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [outlineTab, setOutlineTab] = useState<DesktopTab>('sections')

  useEffect(() => {
    if (editingSermonId) {
      const s = sermons.find((s) => s.id === editingSermonId)
      if (s) {
        setTitle(s.title); setSpeaker(s.speaker); setDate(s.date)
        setSeries(s.series); setNotes(s.notes); setTags(s.tags || [])
        setSections(s.sections || [])
        if (s.verseReference) setVerseRef(s.verseReference)
        if (s.verseData) setVerseText(s.verseData.text)
        return
      }
    }
    try {
      const raw = localStorage.getItem(CURRENT_KEY)
      if (raw) {
        const s = JSON.parse(raw)
        setTitle(s.title || ''); setSpeaker(s.speaker || ''); setDate(s.date || getTodayString())
        setSeries(s.series || ''); setNotes(s.notes || ''); setTags(s.tags || [])
        setSections(s.sections || [])
        if (s.verseReference) setVerseRef(s.verseReference)
        if (s.verseData) setVerseText(s.verseData.text)
      }
    } catch {}
  }, [editingSermonId, sermons])

  // Auto-pick first section as active on desktop when sections change
  useEffect(() => {
    if (sections.length === 0) { setActiveSectionId(null); return }
    if (!activeSectionId || !sections.find((s) => s.id === activeSectionId)) {
      setActiveSectionId(sections[0].id)
    }
  }, [sections, activeSectionId])

  const collectData = useCallback(() => ({
    title, speaker, date, series, notes, tags, sections,
    verseReference: verseRef,
    verseData: verseText ? { reference: verseRef, text: verseText, translation: 'WEB' } : null,
  }), [title, speaker, date, series, notes, tags, sections, verseRef, verseText])

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      setAutoSave('saving')
      localStorage.setItem(CURRENT_KEY, JSON.stringify(collectData()))
      setTimeout(() => setAutoSave('saved'), 400)
      setTimeout(() => setAutoSave('idle'), 2000)
    }, 1000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [collectData])

  const handleVerseSearch = async () => {
    if (!verseRef.trim()) return
    if (!validateVerseFormat(verseRef)) { setVerseError('Invalid format. Try "John 3:16"'); return }
    setVerseLoading(true); setVerseError('')
    try {
      const text = await fetchVerse(verseRef)
      setVerseText(text)
    } catch {
      setVerseError('Verse not found. Check the reference.')
    } finally {
      setVerseLoading(false)
    }
  }

  const addSection = () => {
    const newSec: SermonSection = { id: generateId(), heading: '', scripture: '', notes: '' }
    setSections((prev) => [...prev, newSec])
    setActiveSectionId(newSec.id)
  }

  const updateSection = (id: string, field: keyof SermonSection, value: string) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s))
  }

  const deleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id))
  }

  const applyTemplate = (template: SermonTemplate) => {
    setSections(template.sections.map((s) => ({ ...s, id: generateId() })))
  }

  const handleSave = () => {
    const data = collectData()
    saveSermon(data as any)
    localStorage.removeItem(CURRENT_KEY)
  }

  const handleStartPreaching = () => {
    const data = collectData()
    localStorage.setItem(CURRENT_KEY, JSON.stringify(data))
    router.push('/preaching')
  }

  const handleClear = () => {
    setTitle(''); setSpeaker(''); setDate(getTodayString()); setSeries('')
    setVerseRef(''); setVerseText(''); setNotes(''); setTags([]); setSections([])
    setEditingSermonId(null)
    localStorage.removeItem(CURRENT_KEY)
    setShowClearConfirm(false)
  }

  const handleExport = () => {
    const data = collectData()
    const html = `<!DOCTYPE html><html><head><title>${data.title}</title></head><body>
      <h1>${data.title}</h1>
      <p><strong>Speaker:</strong> ${data.speaker} | <strong>Date:</strong> ${data.date}</p>
      ${data.series ? `<p><strong>Series:</strong> ${data.series}</p>` : ''}
      ${data.verseReference ? `<p><strong>Scripture:</strong> ${data.verseReference}</p>` : ''}
      ${data.notes ? `<h2>Notes</h2><p>${data.notes.replace(/\n/g, '<br>')}</p>` : ''}
      ${data.sections.map((s: SermonSection) => `
        <h2>${s.heading}</h2>
        ${s.scripture ? `<p><em>${s.scripture}</em></p>` : ''}
        <p>${s.notes.replace(/\n/g, '<br>')}</p>
      `).join('')}
    </body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${data.title || 'sermon'}.html`
    a.click(); URL.revokeObjectURL(url)
  }

  const insertVerseIntoActive = () => {
    if (!verseText) return
    if (activeSectionId) {
      updateSection(activeSectionId, 'notes',
        (sections.find((s) => s.id === activeSectionId)?.notes || '') +
        ((sections.find((s) => s.id === activeSectionId)?.notes ? '\n\n' : '')) +
        `${verseRef}: "${verseText}"`,
      )
    } else {
      setNotes((n) => n + (n ? '\n\n' : '') + `${verseRef}: "${verseText}"`)
    }
  }

  const activeSection = sections.find((s) => s.id === activeSectionId) ?? null
  const activeSectionIndex = activeSection ? sections.findIndex((s) => s.id === activeSection.id) : -1

  const mobileHeader = (
    <div className="flex items-center justify-between px-4 py-3 md:hidden">
      <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
        {editingSermonId ? 'Edit Sermon' : 'New Sermon'}
      </h1>
      <div className="flex items-center gap-2">
        {autoSave === 'saving' && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Saving…</span>
        )}
        {autoSave === 'saved' && (
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--accent-primary)' }}>
            <Check size={12} /> Saved
          </span>
        )}
        <Button size="sm" onClick={handleSave}>
          <Save size={14} /> Save
        </Button>
      </div>
    </div>
  )

  return (
    <AppShell header={mobileHeader} fullBleed>
      {/* ─── MOBILE (< md) — original stacked form ─── */}
      <div className="md:hidden max-w-2xl mx-auto py-4 px-4 space-y-5 pb-24">
        <section className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sermon title…"
            className="w-full text-lg font-bold bg-transparent border-0 border-b pb-2 outline-none"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-muted)' }}>Speaker</label>
              <input type="text" value={speaker} onChange={(e) => setSpeaker(e.target.value)} placeholder="Speaker name" className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-muted)' }}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-muted)' }}>Series</label>
            <input type="text" value={series} onChange={(e) => setSeries(e.target.value)} placeholder="Series name (optional)" className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
        </section>

        <section className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: 'var(--text-muted)' }}>Tags</label>
          <TagInput tags={tags} onChange={setTags} sermons={sermons} />
        </section>

        <section className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <label className="text-xs font-semibold uppercase tracking-wide block" style={{ color: 'var(--text-muted)' }}>Key Scripture</label>
          <div className="flex gap-2">
            <input type="text" value={verseRef} onChange={(e) => setVerseRef(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleVerseSearch()} placeholder="e.g. John 3:16" className="flex-1 px-3 py-2 rounded-lg border text-sm bg-transparent" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
            <Button size="sm" onClick={handleVerseSearch} disabled={verseLoading}>
              <Search size={14} /> {verseLoading ? '…' : 'Look up'}
            </Button>
          </div>
          {verseError && <p className="text-xs text-red-500">{verseError}</p>}
          {verseText && (
            <div className="p-3 rounded-lg text-sm italic" style={{ backgroundColor: 'var(--verse-bg)', borderLeft: '3px solid var(--verse-border)', color: 'var(--text-secondary)' }}>
              <p className="font-semibold not-italic text-xs mb-1" style={{ color: 'var(--accent-primary)' }}>{verseRef}</p>
              <p>"{verseText}"</p>
              <button onClick={() => setNotes((n) => n + (n ? '\n\n' : '') + `${verseRef}: "${verseText}"`)} className="text-xs font-medium mt-2" style={{ color: 'var(--accent-primary)' }}>+ Add to notes</button>
            </div>
          )}
        </section>

        <section className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: 'var(--text-muted)' }}>General Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="General notes, introduction ideas, illustrations…" rows={5} className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent resize-y" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Outline ({sections.length} sections)</h2>
            <button onClick={() => setShowTemplate(true)} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
              <LayoutTemplate size={13} /> Use template
            </button>
          </div>
          {sections.map((s, i) => (
            <SermonSectionCard key={s.id} section={s} index={i} onChange={updateSection} onDelete={deleteSection} />
          ))}
          <Button variant="secondary" fullWidth onClick={addSection}>
            <Plus size={16} /> Add Section
          </Button>
        </section>

        <section className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <Button fullWidth onClick={handleStartPreaching} disabled={!sections.length}>
            <Play size={16} /> Start Preaching Mode
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={handleExport}>
              <Download size={14} /> Export HTML
            </Button>
            <Button variant="secondary" onClick={async () => {
              const { generatePowerPoint } = await import('@/lib/powerpoint')
              generatePowerPoint(collectData() as any)
            }}>
              <Presentation size={14} /> PowerPoint
            </Button>
          </div>
          <Button variant="danger" fullWidth onClick={() => setShowClearConfirm(true)}>
            <Trash2 size={14} /> Clear Form
          </Button>
        </section>
      </div>

      {/* ─── DESKTOP (≥ md) — 3-pane workspace ─── */}
      <div className="hidden md:flex flex-col h-[calc(100dvh-env(safe-area-inset-top))]">
        {/* Sticky header */}
        <header
          className="flex items-center justify-between px-5 h-14 border-b flex-shrink-0"
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled sermon"
              className="text-base font-semibold tracking-tight bg-transparent outline-none border-0 min-w-0 truncate"
              style={{ color: 'var(--text-primary)' }}
            />
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              {autoSave === 'saving' && 'Saving…'}
              {autoSave === 'saved' && (
                <span className="inline-flex items-center gap-1" style={{ color: 'var(--accent-primary)' }}>
                  <Check size={12} /> Saved
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] text-sm font-medium border transition-colors hover:bg-[var(--surface-hover)]"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            >
              <Save size={13} /> Save
            </button>
            <button
              onClick={handleStartPreaching}
              disabled={!sections.length}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <Play size={13} /> Preach
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Outline / meta pane */}
          <aside
            className="w-[240px] flex-shrink-0 border-r flex flex-col"
            style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-subtle)' }}
          >
            {/* Tab switcher */}
            <div className="flex border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              {(['sections', 'meta'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setOutlineTab(tab)}
                  className="flex-1 h-9 text-xs font-medium transition-colors capitalize"
                  style={{
                    color: outlineTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: `2px solid ${outlineTab === tab ? 'var(--accent-primary)' : 'transparent'}`,
                  }}
                >
                  {tab === 'sections' ? `Outline · ${sections.length}` : 'Details'}
                </button>
              ))}
            </div>

            {outlineTab === 'sections' ? (
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {sections.length === 0 ? (
                  <div className="px-3 py-6 text-center">
                    <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                      No sections yet.
                    </p>
                  </div>
                ) : (
                  sections.map((s, i) => {
                    const active = activeSectionId === s.id
                    return (
                      <button
                        key={s.id}
                        onClick={() => setActiveSectionId(s.id)}
                        className="w-full text-left px-3 py-2 rounded-[var(--radius-md)] transition-colors flex items-start gap-2"
                        style={{
                          backgroundColor: active ? 'var(--surface)' : 'transparent',
                          color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}
                      >
                        <span
                          className="text-[10px] font-semibold mt-0.5 w-4 flex-shrink-0"
                          style={{ color: active ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium truncate flex-1">
                          {s.heading || 'Untitled section'}
                        </span>
                      </button>
                    )
                  })
                )}

                <button
                  onClick={addSection}
                  className="w-full mt-2 inline-flex items-center justify-center gap-1.5 h-8 rounded-[var(--radius-md)] text-xs font-medium border transition-colors hover:bg-[var(--surface-hover)]"
                  style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
                >
                  <Plus size={13} /> Add Section
                </button>

                <button
                  onClick={() => setShowTemplate(true)}
                  className="w-full mt-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-[var(--radius-md)] text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <LayoutTemplate size={13} /> Use template
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] block mb-1.5" style={{ color: 'var(--text-muted)' }}>Speaker</label>
                  <input
                    type="text"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    placeholder="Speaker name"
                    className="w-full px-2.5 h-8 rounded-[var(--radius-md)] border text-sm bg-transparent"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] block mb-1.5" style={{ color: 'var(--text-muted)' }}>Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 h-8 rounded-[var(--radius-md)] border text-sm bg-transparent"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] block mb-1.5" style={{ color: 'var(--text-muted)' }}>Series</label>
                  <input
                    type="text"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    placeholder="Series (optional)"
                    className="w-full px-2.5 h-8 rounded-[var(--radius-md)] border text-sm bg-transparent"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] block mb-1.5" style={{ color: 'var(--text-muted)' }}>Tags</label>
                  <TagInput tags={tags} onChange={setTags} sermons={sermons} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] block mb-1.5" style={{ color: 'var(--text-muted)' }}>General Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Sermon-wide notes…"
                    rows={6}
                    className="w-full px-2.5 py-2 rounded-[var(--radius-md)] border text-sm bg-transparent resize-y"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
                  />
                </div>

                <div className="pt-3 border-t space-y-1.5" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button
                    onClick={handleExport}
                    className="w-full inline-flex items-center gap-2 h-8 px-2.5 rounded-[var(--radius-md)] text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Download size={13} /> Export HTML
                  </button>
                  <button
                    onClick={async () => {
                      const { generatePowerPoint } = await import('@/lib/powerpoint')
                      generatePowerPoint(collectData() as any)
                    }}
                    className="w-full inline-flex items-center gap-2 h-8 px-2.5 rounded-[var(--radius-md)] text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Presentation size={13} /> Export PowerPoint
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full inline-flex items-center gap-2 h-8 px-2.5 rounded-[var(--radius-md)] text-xs font-medium transition-colors hover:bg-[#fee2e2] dark:hover:bg-[#7f1d1d]/30"
                    style={{ color: '#dc2626' }}
                  >
                    <Trash2 size={13} /> Clear form
                  </button>
                </div>
              </div>
            )}
          </aside>

          {/* Editor pane (focused on active section) */}
          <main className="flex-1 overflow-y-auto">
            {activeSection ? (
              <div className="max-w-2xl mx-auto px-8 py-8 space-y-6">
                <div className="flex items-center justify-between">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Section {activeSectionIndex + 1} of {sections.length}
                  </p>
                  <button
                    onClick={() => deleteSection(activeSection.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                    style={{ color: '#dc2626' }}
                  >
                    <Trash2 size={12} /> Delete section
                  </button>
                </div>

                <input
                  type="text"
                  value={activeSection.heading}
                  onChange={(e) => updateSection(activeSection.id, 'heading', e.target.value)}
                  placeholder="Section heading"
                  className="w-full text-2xl font-semibold tracking-tight bg-transparent outline-none border-0 border-b pb-2"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] block mb-1.5" style={{ color: 'var(--text-muted)' }}>Scripture</label>
                  <input
                    type="text"
                    value={activeSection.scripture}
                    onChange={(e) => updateSection(activeSection.id, 'scripture', e.target.value)}
                    placeholder="John 3:16"
                    className="w-full px-3 h-9 rounded-[var(--radius-md)] border text-sm bg-transparent"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] block mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes</label>
                  <textarea
                    value={activeSection.notes}
                    onChange={(e) => updateSection(activeSection.id, 'notes', e.target.value)}
                    placeholder="Notes, illustrations, points to make…"
                    rows={18}
                    className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-sm leading-relaxed bg-transparent resize-y"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
                  />
                </div>

                {sections.length > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <button
                      onClick={() => {
                        const i = sections.findIndex((s) => s.id === activeSection.id)
                        if (i > 0) setActiveSectionId(sections[i - 1].id)
                      }}
                      disabled={activeSectionIndex === 0}
                      className="text-xs font-medium transition-colors disabled:opacity-30"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => {
                        const i = sections.findIndex((s) => s.id === activeSection.id)
                        if (i < sections.length - 1) setActiveSectionId(sections[i + 1].id)
                      }}
                      disabled={activeSectionIndex === sections.length - 1}
                      className="inline-flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-30"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      Next section <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center px-6 py-16 text-center">
                <TypeIcon size={32} className="mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                  Add your first section to start writing.
                </p>
                <button
                  onClick={addSection}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  <Plus size={14} /> Add Section
                </button>
              </div>
            )}
          </main>

          {/* Scripture lookup pane */}
          <aside
            className="hidden lg:flex flex-col w-[300px] flex-shrink-0 border-l overflow-y-auto"
            style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="px-4 h-9 flex items-center border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
                Scripture
              </p>
            </div>

            <div className="p-3 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={verseRef}
                  onChange={(e) => setVerseRef(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerseSearch()}
                  placeholder="John 3:16"
                  className="flex-1 px-2.5 h-8 rounded-[var(--radius-md)] border text-sm bg-transparent"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
                />
                <button
                  onClick={handleVerseSearch}
                  disabled={verseLoading}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                  aria-label="Look up verse"
                >
                  <Search size={13} />
                </button>
              </div>

              {verseError && <p className="text-xs" style={{ color: '#dc2626' }}>{verseError}</p>}

              {verseText && (
                <div
                  className="rounded-[var(--radius-md)] border p-3"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)' }}
                >
                  <p className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--accent-primary)' }}>{verseRef}</p>
                  <p
                    className="text-sm leading-relaxed mb-3"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
                  >
                    "{verseText}"
                  </p>
                  <button
                    onClick={insertVerseIntoActive}
                    disabled={!activeSection && !notes && sections.length === 0}
                    className="w-full inline-flex items-center justify-center gap-1.5 h-7 rounded-[var(--radius-md)] text-xs font-medium transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-50"
                    style={{ color: 'var(--accent-primary)', border: `1px solid var(--border-color)` }}
                  >
                    <Plus size={12} /> Insert into {activeSection ? `section ${activeSectionIndex + 1}` : 'notes'}
                  </button>
                </div>
              )}

              {!verseText && !verseError && (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Look up a passage and insert it into the active section's notes.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <TemplatePickerModal open={showTemplate} onClose={() => setShowTemplate(false)} onSelect={applyTemplate} />
      <ConfirmModal
        open={showClearConfirm}
        title="Clear Form"
        message="This will clear all current sermon data. Are you sure?"
        confirmLabel="Clear"
        danger
        onConfirm={handleClear}
        onCancel={() => setShowClearConfirm(false)}
      />
    </AppShell>
  )
}
