'use client'

import { create } from 'zustand'
import type { BibleChapter, Translation, HighlightedVerse } from '@/types'
import { BIBLE_BOOKS } from '@/lib/bibleBooks'

const HIGHLIGHTS_KEY = 'bibleHighlights'

interface BibleStore {
  currentBook: string
  currentChapter: number
  currentTranslation: Translation
  currentChapterData: BibleChapter | null
  isLoading: boolean
  error: string | null
  highlights: Set<string>

  setBook: (book: string) => void
  setChapter: (chapter: number) => void
  setTranslation: (t: Translation) => void
  setChapterData: (data: BibleChapter | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  nextChapter: () => void
  previousChapter: () => void
  toggleHighlight: (verseRef: string) => void
  loadHighlights: () => void
  isHighlighted: (verseRef: string) => boolean
}

export const useBibleStore = create<BibleStore>()((set, get) => ({
  currentBook: 'John',
  currentChapter: 1,
  currentTranslation: 'WEB',
  currentChapterData: null,
  isLoading: false,
  error: null,
  highlights: new Set(),

  setBook: (book) => set({ currentBook: book, currentChapter: 1 }),
  setChapter: (chapter) => set({ currentChapter: chapter }),
  setTranslation: (currentTranslation) => set({ currentTranslation }),
  setChapterData: (data) => set({ currentChapterData: data }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  nextChapter: () => {
    const { currentBook, currentChapter } = get()
    const bookData = BIBLE_BOOKS.find((b) => b.name === currentBook)
    if (!bookData) return
    if (currentChapter < bookData.chapters) {
      set({ currentChapter: currentChapter + 1 })
    } else {
      const currentIndex = BIBLE_BOOKS.findIndex((b) => b.name === currentBook)
      if (currentIndex < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[currentIndex + 1]
        set({ currentBook: nextBook.name, currentChapter: 1 })
      }
    }
  },

  previousChapter: () => {
    const { currentBook, currentChapter } = get()
    if (currentChapter > 1) {
      set({ currentChapter: currentChapter - 1 })
    } else {
      const currentIndex = BIBLE_BOOKS.findIndex((b) => b.name === currentBook)
      if (currentIndex > 0) {
        const prevBook = BIBLE_BOOKS[currentIndex - 1]
        set({ currentBook: prevBook.name, currentChapter: prevBook.chapters })
      }
    }
  },

  toggleHighlight: (verseRef) => {
    const highlights = new Set(get().highlights)
    if (highlights.has(verseRef)) {
      highlights.delete(verseRef)
    } else {
      highlights.add(verseRef)
    }
    set({ highlights })
    if (typeof window !== 'undefined') {
      localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify([...highlights]))
    }
  },

  loadHighlights: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(HIGHLIGHTS_KEY)
      const arr = raw ? JSON.parse(raw) : []
      set({ highlights: new Set(arr) })
    } catch {
      set({ highlights: new Set() })
    }
  },

  isHighlighted: (verseRef) => get().highlights.has(verseRef),
}))
