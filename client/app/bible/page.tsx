'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Type, Copy, Highlighter, Share2, X, Search } from 'lucide-react'
import { useBibleStore } from '@/store/bibleStore'
import { useThemeStore } from '@/store/themeStore'
import { fetchChapter } from '@/lib/bibleApi'
import { BIBLE_BOOKS, OT_BOOKS, NT_BOOKS } from '@/lib/bibleBooks'
import { copyToClipboard } from '@/lib/utils'
import { isRedLetterVerse } from '@/lib/redLetterVerses'
import { Modal } from '@/components/ui/Modal'
import { BottomNav } from '@/components/layout/BottomNav'
import { SideNav } from '@/components/layout/SideNav'
import type { Translation, BibleVerse, Theme, FontSize } from '@/types'

const TRANSLATIONS: Translation[] = ['WEB', 'KJV', 'NKJV', 'ESV', 'NLT', 'ASV', 'BBE']

type PickerView = 'books' | 'chapters'

export default function BiblePage() {
  const {
    currentBook, currentChapter, currentTranslation,
    currentChapterData, isLoading, error,
    setBook, setChapter, setTranslation, setChapterData, setLoading, setError,
    nextChapter, previousChapter, toggleHighlight, isHighlighted,
  } = useBibleStore()
  const { theme, fontSize, setTheme, setFontSize } = useThemeStore()

  const [showPicker, setShowPicker] = useState(false)
  const [pickerView, setPickerView] = useState<PickerView>('books')
  const [pickerBook, setPickerBook] = useState(currentBook)
  const [bookFilter, setBookFilter] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [selectedVerse, setSelectedVerse] = useState<{ ref: string; text: string } | null>(null)
  const [copyNotice, setCopyNotice] = useState(false)
  const [chromeVisible, setChromeVisible] = useState(true)
  const lastScrollY = useRef(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await fetchChapter(currentBook, currentChapter, currentTranslation)
      setChapterData(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load chapter')
    } finally {
      setLoading(false)
    }
  }, [currentBook, currentChapter, currentTranslation, setLoading, setError, setChapterData])

  useEffect(() => { load() }, [load])

  const handleNav = (dir: 'next' | 'prev') => {
    if (dir === 'next') nextChapter(); else previousChapter()
    contentRef.current?.scrollTo({ top: 0 })
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop
    const delta = y - lastScrollY.current
    if (y < 24) setChromeVisible(true)
    else if (delta > 6) setChromeVisible(false)
    else if (delta < -6) setChromeVisible(true)
    lastScrollY.current = y
  }

  const handleVerseClick = (verse: BibleVerse) => {
    const ref = `${currentBook} ${currentChapter}:${verse.verse}`
    setSelectedVerse(prev => prev?.ref === ref ? null : { ref, text: verse.text })
  }

  const handleCopy = async () => {
    if (!selectedVerse) return
    await copyToClipboard(`${selectedVerse.ref} — "${selectedVerse.text}" (${currentTranslation})`)
    setCopyNotice(true); setTimeout(() => setCopyNotice(false), 1600)
    setSelectedVerse(null)
  }

  const handleHighlight = () => {
    if (selectedVerse) { toggleHighlight(selectedVerse.ref); setSelectedVerse(null) }
  }

  const openPicker = () => {
    setPickerBook(currentBook)
    setPickerView('books')
    setBookFilter('')
    setShowPicker(true)
  }

  const fontSizes: Record<FontSize, string> = { small: '15px', medium: '17px', large: '19px', xlarge: '22px' }
  const fontSizeLabels: Record<FontSize, string> = { small: 'Aa', medium: 'Aa', large: 'Aa', xlarge: 'Aa' }

  const filteredBooks = useMemo(() => {
    const q = bookFilter.trim().toLowerCase()
    if (!q) return { ot: OT_BOOKS, nt: NT_BOOKS }
    return {
      ot: OT_BOOKS.filter(b => b.name.toLowerCase().includes(q)),
      nt: NT_BOOKS.filter(b => b.name.toLowerCase().includes(q)),
    }
  }, [bookFilter])

  const pickerBookChapters = BIBLE_BOOKS.find(b => b.name === pickerBook)?.chapters ?? 1
  const currentBookChapters = BIBLE_BOOKS.find(b => b.name === currentBook)?.chapters ?? 1

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <SideNav />
      <div className="flex min-h-dvh md:pl-56">

      {/* Desktop chapter rail — list of chapters in current book */}
      <aside
        className="hidden lg:flex flex-col w-[200px] flex-shrink-0 border-r overflow-hidden"
        style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="px-4 h-14 flex items-center border-b flex-shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={openPicker}
            className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {currentBook}
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
          Chapters
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: currentBookChapters }, (_, i) => i + 1).map((ch) => {
              const active = currentChapter === ch
              return (
                <button
                  key={ch}
                  onClick={() => { setChapter(ch); contentRef.current?.scrollTo({ top: 0 }) }}
                  className="aspect-square rounded-[var(--radius-sm)] text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--accent-primary)' : 'transparent',
                    color: active ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {ch}
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Reading column wrapper */}
      <div className="flex flex-col flex-1 min-w-0 relative">
      {/* Minimal top bar */}
      <header
        className="sticky top-0 z-30 transition-transform duration-300"
        style={{
          backgroundColor: 'var(--bg-primary)',
          transform: chromeVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] py-3 max-w-2xl mx-auto">
          <button
            onClick={openPicker}
            className="flex items-center gap-1.5 text-[15px] font-semibold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {currentBook} {currentChapter}
            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={openPicker}
              className="px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide"
              style={{ color: 'var(--text-muted)' }}
            >
              {currentTranslation}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-md"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Reading settings"
            >
              <Type size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Reading surface */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto pb-32"
        onScroll={handleScroll}
      >
        <article
          className="max-w-[640px] mx-auto px-6 sm:px-8 pt-6 pb-20"
          style={{
            fontSize: fontSizes[fontSize],
            fontFamily: 'Charter, Georgia, "Iowan Old Style", "Times New Roman", serif',
            lineHeight: 1.75,
            letterSpacing: '0.005em',
          }}
        >
          {/* Chapter heading — minimal, large, quiet */}
          <header className="mb-8">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {currentTranslation}
            </p>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
            >
              {currentBook} {currentChapter}
            </h1>
          </header>

          {isLoading && (
            <div className="flex justify-center py-20">
              <div
                className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
              />
            </div>
          )}

          {error && !isLoading && (
            <div className="text-center py-20">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
              <button
                onClick={load}
                className="mt-3 text-sm font-medium underline underline-offset-4"
                style={{ color: 'var(--accent-primary)' }}
              >
                Try again
              </button>
            </div>
          )}

          {currentChapterData && !isLoading && (
            <>
              <div>
                {currentChapterData.verses.map((verse) => {
                  const ref = `${currentBook} ${currentChapter}:${verse.verse}`
                  const highlighted = isHighlighted(ref)
                  const selected = selectedVerse?.ref === ref
                  const isRed = isRedLetterVerse(currentBook, currentChapter, verse.verse)
                  return (
                    <span
                      key={verse.verse}
                      onClick={() => handleVerseClick(verse)}
                      className="cursor-pointer transition-colors"
                      style={{
                        color: isRed ? 'var(--red-letter)' : 'var(--text-primary)',
                        backgroundColor: highlighted
                          ? 'var(--highlight-bg)'
                          : selected
                            ? 'var(--verse-bg)'
                            : 'transparent',
                        borderRadius: highlighted || selected ? '3px' : 0,
                        padding: highlighted || selected ? '1px 2px' : 0,
                        boxShadow: selected ? 'inset 0 -2px 0 var(--accent-primary)' : 'none',
                      }}
                    >
                      <sup
                        className="font-sans font-semibold mr-1 select-none"
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.6em',
                          verticalAlign: 'super',
                          opacity: 0.85,
                        }}
                      >
                        {verse.verse}
                      </sup>
                      {verse.text}{' '}
                    </span>
                  )
                })}
              </div>

              {/* Inline next/prev — quiet, end-of-chapter */}
              <div
                className="mt-12 pt-8 flex items-center justify-between"
                style={{ borderTop: '1px solid var(--border-color)' }}
              >
                <button
                  onClick={() => handleNav('prev')}
                  className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'var(--text-muted)', fontFamily: 'system-ui, sans-serif' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  onClick={() => handleNav('next')}
                  className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: 'var(--accent-primary)', fontFamily: 'system-ui, sans-serif' }}
                >
                  Next chapter <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </article>
      </div>

      {/* Floating chapter nav (tablet only — lg uses the rail) */}
      <button
        onClick={() => handleNav('prev')}
        className="hidden md:flex lg:hidden fixed left-60 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 rounded-full border transition-colors hover:bg-[var(--surface-hover)] z-20"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-sm)',
        }}
        aria-label="Previous chapter"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => handleNav('next')}
        className="hidden md:flex lg:hidden fixed right-4 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 rounded-full border transition-colors hover:bg-[var(--surface-hover)] z-20"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-sm)',
        }}
        aria-label="Next chapter"
      >
        <ChevronRight size={18} />
      </button>

      </div>{/* /reading column wrapper */}

      <BottomNav />

      {/* Verse action toolbar — top sheet, YouVersion style */}
      {selectedVerse && (
        <div
          className="fixed top-0 inset-x-0 md:left-56 lg:left-[424px] z-50 transition-transform"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-color)',
            paddingTop: 'env(safe-area-inset-top)',
            boxShadow: '0 4px 16px var(--shadow-color)',
          }}
        >
          <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-1">
            <span
              className="text-sm font-semibold flex-1 truncate"
              style={{ color: 'var(--accent-primary)' }}
            >
              {selectedVerse.ref}
            </span>
            <button onClick={handleCopy} className="p-2.5 rounded-full" style={{ color: 'var(--text-primary)' }} aria-label="Copy">
              <Copy size={18} />
            </button>
            <button onClick={handleHighlight} className="p-2.5 rounded-full" style={{ color: 'var(--accent-gold)' }} aria-label="Highlight">
              <Highlighter size={18} />
            </button>
            <button
              onClick={async () => {
                if (navigator.share) {
                  try { await navigator.share({ text: `${selectedVerse.ref}: "${selectedVerse.text}"` }) } catch {}
                }
                setSelectedVerse(null)
              }}
              className="p-2.5 rounded-full"
              style={{ color: 'var(--text-primary)' }}
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={() => setSelectedVerse(null)}
              className="p-2.5 rounded-full"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Copy toast */}
      {copyNotice && (
        <div className="fixed top-20 inset-x-0 md:left-56 lg:left-[424px] flex justify-center z-50 pointer-events-none">
          <div
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: 'var(--text-primary)' }}
          >
            Copied
          </div>
        </div>
      )}

      {/* Two-step picker: books → chapters */}
      <Modal open={showPicker} onClose={() => setShowPicker(false)} title={pickerView === 'books' ? 'Books' : pickerBook} size="lg">
        <div className="flex flex-col">
          {/* Translation row — always visible */}
          <div
            className="px-4 py-3 flex items-center gap-2 overflow-x-auto"
            style={{ borderBottom: '1px solid var(--border-color)' }}
          >
            {TRANSLATIONS.map((t) => (
              <button
                key={t}
                onClick={() => setTranslation(t)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-colors"
                style={{
                  backgroundColor: currentTranslation === t ? 'var(--accent-primary)' : 'transparent',
                  color: currentTranslation === t ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${currentTranslation === t ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {pickerView === 'books' ? (
            <>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <Search size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    autoFocus
                    value={bookFilter}
                    onChange={(e) => setBookFilter(e.target.value)}
                    placeholder="Find a book"
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: '60dvh' }}>
                {[
                  { label: 'Old Testament', books: filteredBooks.ot },
                  { label: 'New Testament', books: filteredBooks.nt },
                ].map(({ label, books }) => books.length > 0 && (
                  <div key={label}>
                    <div
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] sticky top-0"
                      style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
                    >
                      {label}
                    </div>
                    {books.map((b) => (
                      <button
                        key={b.name}
                        onClick={() => { setPickerBook(b.name); setPickerView('chapters') }}
                        className="w-full text-left px-4 py-3 text-[15px] transition-colors flex items-center justify-between"
                        style={{
                          color: 'var(--text-primary)',
                          fontWeight: currentBook === b.name ? 600 : 400,
                          backgroundColor: currentBook === b.name ? 'var(--bg-secondary)' : 'transparent',
                        }}
                      >
                        <span>{b.name}</span>
                        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4">
              <button
                onClick={() => setPickerView('books')}
                className="flex items-center gap-1 text-sm font-medium mb-4"
                style={{ color: 'var(--accent-primary)' }}
              >
                <ChevronLeft size={16} /> All books
              </button>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {Array.from({ length: pickerBookChapters }, (_, i) => i + 1).map((ch) => {
                  const isActive = currentBook === pickerBook && currentChapter === ch
                  return (
                    <button
                      key={ch}
                      onClick={() => { setBook(pickerBook); setChapter(ch); setShowPicker(false) }}
                      className="aspect-square rounded-lg text-sm font-semibold transition-colors"
                      style={{
                        backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                        color: isActive ? '#fff' : 'var(--text-primary)',
                      }}
                    >
                      {ch}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Reading settings — minimal sheet */}
      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Display" size="sm">
        <div className="p-5 space-y-6">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Text Size
            </p>
            <div className="flex items-end gap-2">
              {(['small', 'medium', 'large', 'xlarge'] as FontSize[]).map((s, i) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className="flex-1 rounded-lg transition-colors flex items-center justify-center"
                  style={{
                    backgroundColor: fontSize === s ? 'var(--bg-secondary)' : 'transparent',
                    color: fontSize === s ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: `1px solid ${fontSize === s ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    fontSize: `${12 + i * 3}px`,
                    height: '52px',
                    fontFamily: 'Charter, Georgia, serif',
                    fontWeight: 600,
                  }}
                >
                  {fontSizeLabels[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Theme
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'sepia', 'dark'] as Theme[]).map((t) => {
                const swatch = t === 'light' ? '#ffffff' : t === 'sepia' ? '#f4ede4' : '#0f0f1a'
                const fg = t === 'dark' ? '#e8e8f0' : '#1a1a2e'
                return (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className="rounded-lg overflow-hidden transition-all"
                    style={{
                      border: `2px solid ${theme === t ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    }}
                  >
                    <div
                      className="h-14 flex items-center justify-center"
                      style={{ backgroundColor: swatch, color: fg, fontFamily: 'Charter, Georgia, serif' }}
                    >
                      <span className="text-base font-semibold">Aa</span>
                    </div>
                    <div
                      className="text-[11px] font-medium py-1.5 capitalize"
                      style={{
                        color: theme === t ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-card)',
                      }}
                    >
                      {t}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  )
}
