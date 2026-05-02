'use client'

import { create } from 'zustand'
import type { Theme, FontSize } from '@/types'

const THEME_KEY = 'appTheme'
const FONT_KEY = 'appFontSize'

const themes: Record<Theme, Record<string, string>> = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f8f9fa',
    '--bg-tertiary': '#e9ecef',
    '--bg-card': '#ffffff',
    '--text-primary': '#1a1a2e',
    '--text-secondary': '#4a4a6a',
    '--text-muted': '#6c757d',
    '--accent-primary': '#6b46c1',
    '--accent-secondary': '#805ad5',
    '--accent-gold': '#d4a017',
    '--border-color': '#dee2e6',
    '--shadow-color': 'rgba(0,0,0,0.1)',
    '--verse-bg': '#f0f4ff',
    '--verse-border': '#6b46c1',
    '--highlight-bg': '#fff3cd',
  },
  dark: {
    '--bg-primary': '#0f0f1a',
    '--bg-secondary': '#1a1a2e',
    '--bg-tertiary': '#252540',
    '--bg-card': '#1e1e35',
    '--text-primary': '#e8e8f0',
    '--text-secondary': '#b0b0c8',
    '--text-muted': '#7070a0',
    '--accent-primary': '#9d72ff',
    '--accent-secondary': '#b08fff',
    '--accent-gold': '#f0c040',
    '--border-color': '#333355',
    '--shadow-color': 'rgba(0,0,0,0.4)',
    '--verse-bg': '#1a1a35',
    '--verse-border': '#9d72ff',
    '--highlight-bg': '#3d3000',
  },
  sepia: {
    '--bg-primary': '#f4ede4',
    '--bg-secondary': '#ede0d0',
    '--bg-tertiary': '#e0d0bc',
    '--bg-card': '#f4ede4',
    '--text-primary': '#2d1f0e',
    '--text-secondary': '#5c3d1e',
    '--text-muted': '#8b6540',
    '--accent-primary': '#8b4513',
    '--accent-secondary': '#a0522d',
    '--accent-gold': '#b8860b',
    '--border-color': '#c8a882',
    '--shadow-color': 'rgba(0,0,0,0.15)',
    '--verse-bg': '#ede0c8',
    '--verse-border': '#8b4513',
    '--highlight-bg': '#f5e6c8',
  },
}

const fontSizes: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
  xlarge: '20px',
}

interface ThemeStore {
  theme: Theme
  fontSize: FontSize
  setTheme: (theme: Theme) => void
  setFontSize: (size: FontSize) => void
  toggleTheme: () => void
  cycleFontSize: () => void
  applyTheme: () => void
  loadFromStorage: () => void
}

function applyToDOM(theme: Theme, fontSize: FontSize) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.setAttribute('data-font-size', fontSize)
  const vars = themes[theme]
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
  root.style.setProperty('--font-size-base', fontSizes[fontSize])
}

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  theme: 'light',
  fontSize: 'medium',

  loadFromStorage: () => {
    if (typeof window === 'undefined') return
    const theme = (localStorage.getItem(THEME_KEY) as Theme) || 'light'
    const fontSize = (localStorage.getItem(FONT_KEY) as FontSize) || 'medium'
    set({ theme, fontSize })
    applyToDOM(theme, fontSize)
  },

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme)
    set({ theme })
    applyToDOM(theme, get().fontSize)
  },

  setFontSize: (fontSize) => {
    localStorage.setItem(FONT_KEY, fontSize)
    set({ fontSize })
    applyToDOM(get().theme, fontSize)
  },

  toggleTheme: () => {
    const order: Theme[] = ['light', 'sepia', 'dark']
    const current = get().theme
    const next = order[(order.indexOf(current) + 1) % order.length]
    get().setTheme(next)
  },

  cycleFontSize: () => {
    const order: FontSize[] = ['small', 'medium', 'large', 'xlarge']
    const current = get().fontSize
    const next = order[(order.indexOf(current) + 1) % order.length]
    get().setFontSize(next)
  },

  applyTheme: () => applyToDOM(get().theme, get().fontSize),
}))
