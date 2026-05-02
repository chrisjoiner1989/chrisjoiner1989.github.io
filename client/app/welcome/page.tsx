'use client'

import { useRouter } from 'next/navigation'
import { PenLine, BookOpen, Library, Calendar, ArrowRight } from 'lucide-react'
import { BrandMark } from '@/components/ui/BrandMark'

const FEATURES = [
  { icon: PenLine, title: 'Sermon Builder', desc: 'Build structured sermons with outlines, scripture, and templates' },
  { icon: BookOpen, title: 'Bible Reader', desc: '7 translations, verse highlights, and chapter caching' },
  { icon: Library, title: 'Sermon Library', desc: 'Search, filter, and manage all your sermons' },
  { icon: Calendar, title: 'Calendar View', desc: 'Schedule and drag-and-drop sermons on a calendar' },
]

export default function WelcomePage() {
  const router = useRouter()

  const handleStart = () => {
    localStorage.setItem('hasSeenWelcome', 'true')
    router.replace('/')
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}
    >
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <BrandMark size="xl" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Mount Builder</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Your sermon preparation companion
          </p>
        </div>

        <div className="space-y-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 p-3.5 rounded-xl"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--verse-bg)' }}
              >
                <Icon size={18} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-base shadow-lg"
          style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
        >
          Get Started <ArrowRight size={20} />
        </button>
      </div>
    </div>
  )
}
