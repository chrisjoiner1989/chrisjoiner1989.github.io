'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Sermon, SermonSection } from '@/types'

const STORAGE_KEY = 'mountBuilderSermons'

interface SermonStore {
  sermons: Sermon[]
  currentSermon: Partial<Sermon> | null
  editingSermonId: number | null

  loadSermons: () => void
  saveSermon: (data: Omit<Sermon, 'id' | 'createdAt' | 'lastModified'>) => number
  updateSermon: (id: number, data: Partial<Sermon>) => void
  deleteSermon: (id: number) => void
  setCurrentSermon: (sermon: Partial<Sermon> | null) => void
  setEditingSermonId: (id: number | null) => void
  getSermonById: (id: number) => Sermon | undefined
  clearCurrentSermon: () => void
}

function readFromStorage(): Sermon[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeToStorage(sermons: Sermon[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sermons))
  } catch {}
}

export const useSermonStore = create<SermonStore>()((set, get) => ({
  sermons: [],
  currentSermon: null,
  editingSermonId: null,

  loadSermons: () => {
    const sermons = readFromStorage()
    set({ sermons })
  },

  saveSermon: (data) => {
    const now = new Date().toISOString()
    const { editingSermonId, sermons } = get()

    if (editingSermonId) {
      const updated = sermons.map((s) =>
        s.id === editingSermonId ? { ...s, ...data, lastModified: now } : s
      )
      writeToStorage(updated)
      set({ sermons: updated, editingSermonId: null, currentSermon: null })
      return editingSermonId
    }

    const id = Date.now()
    const sermon: Sermon = {
      id,
      ...data,
      createdAt: now,
      lastModified: now,
    }
    const updated = [...sermons, sermon]
    writeToStorage(updated)
    set({ sermons: updated, currentSermon: null })
    return id
  },

  updateSermon: (id, data) => {
    const now = new Date().toISOString()
    const updated = get().sermons.map((s) =>
      s.id === id ? { ...s, ...data, lastModified: now } : s
    )
    writeToStorage(updated)
    set({ sermons: updated })
  },

  deleteSermon: (id) => {
    const updated = get().sermons.filter((s) => s.id !== id)
    writeToStorage(updated)
    set({ sermons: updated })
  },

  setCurrentSermon: (sermon) => set({ currentSermon: sermon }),

  setEditingSermonId: (id) => set({ editingSermonId: id }),

  getSermonById: (id) => get().sermons.find((s) => s.id === id),

  clearCurrentSermon: () => set({ currentSermon: null, editingSermonId: null }),
}))
