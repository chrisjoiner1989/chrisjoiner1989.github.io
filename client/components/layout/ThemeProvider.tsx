'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useSermonStore } from '@/store/sermonStore'
import { useAuthStore } from '@/store/authStore'
import { useBibleStore } from '@/store/bibleStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const loadTheme = useThemeStore((s) => s.loadFromStorage)
  const loadSermons = useSermonStore((s) => s.loadSermons)
  const loadAuth = useAuthStore((s) => s.loadFromStorage)
  const loadHighlights = useBibleStore((s) => s.loadHighlights)

  useEffect(() => {
    loadTheme()
    loadSermons()
    loadAuth()
    loadHighlights()
  }, [loadTheme, loadSermons, loadAuth, loadHighlights])

  return <>{children}</>
}
