'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Moon, Sun, X } from 'lucide-react'
import { ConfirmModal } from '@/components/ui/Modal'
import type { Sermon } from '@/types'

const CURRENT_KEY = 'currentSermon'

function pad(n: number) { return String(n).padStart(2, '0') }
function formatTime(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export default function PreachingPage() {
  const router = useRouter()
  const [sermon, setSermon] = useState<Sermon | null>(null)
  const [sectionIndex, setSectionIndex] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [darkMode, setDarkMode] = useState(false)
  const [showExit, setShowExit] = useState(false)
  const [fade, setFade] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CURRENT_KEY)
      if (!raw) { router.replace('/builder'); return }
      const data = JSON.parse(raw)
      if (!data.sections?.length) { router.replace('/builder'); return }
      setSermon(data)
    } catch { router.replace('/builder') }
    const savedDark = localStorage.getItem('preachingModeDarkMode')
    if (savedDark === 'true') setDarkMode(true)
  }, [router])

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerRunning])

  const navigate = useCallback((dir: 'prev' | 'next') => {
    if (!sermon) return
    const newIndex = dir === 'next'
      ? Math.min(sectionIndex + 1, sermon.sections.length - 1)
      : Math.max(sectionIndex - 1, 0)
    if (newIndex === sectionIndex) return
    setFade(false)
    setTimeout(() => { setSectionIndex(newIndex); setFade(true) }, 150)
  }, [sermon, sectionIndex])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate('next')
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') navigate('prev')
      else if (e.key === ' ') { e.preventDefault(); setTimerRunning((r) => !r) }
      else if (e.key === 'Escape') setShowExit(true)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [navigate])

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem('preachingModeDarkMode', String(next))
  }

  const resetTimer = () => { setElapsed(0); setTimerRunning(false) }

  if (!sermon) return null

  const section = sermon.sections[sectionIndex]
  const progress = ((sectionIndex + 1) / sermon.sections.length) * 100

  const bg = darkMode ? '#0a0a1a' : '#fafaf8'
  const textColor = darkMode ? '#e8e8f0' : '#1a1a2e'
  const mutedColor = darkMode ? '#7070a0' : '#6c757d'
  const accentColor = darkMode ? '#9d72ff' : '#6b46c1'
  const cardBg = darkMode ? '#12122a' : '#ffffff'
  const borderColor = darkMode ? '#333355' : '#e9ecef'

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ backgroundColor: bg, color: textColor }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor }}>
        <button onClick={() => setShowExit(true)} className="p-2 rounded-lg" style={{ color: mutedColor }}>
          <X size={20} />
        </button>
        <div className="flex-1 text-center px-2">
          <p className="text-sm font-bold truncate" style={{ color: textColor }}>{sermon.title || 'Sermon'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleDark} className="p-2 rounded-lg" style={{ color: mutedColor }}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Timer */}
      <div className="flex items-center justify-center gap-4 py-3 border-b" style={{ borderColor }}>
        <button onClick={() => setTimerRunning((r) => !r)} className="p-2 rounded-full" style={{ color: accentColor }}>
          {timerRunning ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <span className="font-mono text-2xl font-bold tracking-widest" style={{ color: accentColor }}>
          {formatTime(elapsed)}
        </span>
        <button onClick={resetTimer} className="p-2 rounded-full" style={{ color: mutedColor }}>
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Progress */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: mutedColor }}>
            Section {sectionIndex + 1} of {sermon.sections.length}
          </span>
          <span className="text-xs font-medium" style={{ color: accentColor }}>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: borderColor }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: accentColor }}
          />
        </div>
      </div>

      {/* Section content */}
      <main
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.15s' }}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold" style={{ color: textColor }}>
            {section.heading || `Section ${sectionIndex + 1}`}
          </h2>

          {section.scripture && (
            <p className="text-base italic font-semibold" style={{ color: accentColor }}>
              {section.scripture}
            </p>
          )}

          {section.notes && (
            <div
              className="rounded-xl p-4 text-base leading-relaxed whitespace-pre-wrap"
              style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, color: textColor }}
            >
              {section.notes}
            </div>
          )}
        </div>
      </main>

      {/* Nav footer */}
      <footer className="px-4 py-4 border-t flex items-center gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]" style={{ borderColor }}>
        <button
          onClick={() => navigate('prev')}
          disabled={sectionIndex === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border disabled:opacity-30"
          style={{ borderColor, color: textColor }}
        >
          <ChevronLeft size={18} /> Prev
          <span className="text-xs opacity-50 hidden sm:inline">←</span>
        </button>
        <button
          onClick={() => navigate('next')}
          disabled={sectionIndex === sermon.sections.length - 1}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-30"
          style={{ backgroundColor: accentColor }}
        >
          Next <ChevronRight size={18} />
          <span className="text-xs opacity-70 hidden sm:inline">→</span>
        </button>
      </footer>

      <ConfirmModal
        open={showExit}
        title="Exit Preaching Mode"
        message="Are you sure you want to exit preaching mode?"
        confirmLabel="Exit"
        onConfirm={() => router.push('/builder')}
        onCancel={() => setShowExit(false)}
      />
    </div>
  )
}
