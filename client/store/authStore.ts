'use client'

import { create } from 'zustand'
import type { User, SyncStatusInfo } from '@/types'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'currentUser'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  accessToken: string | null
  syncStatus: SyncStatusInfo

  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loadFromStorage: () => void
  refreshAccessToken: () => Promise<boolean>
  syncNow: () => Promise<void>
  uploadAllToCloud: () => Promise<void>
  setSyncStatus: (status: Partial<SyncStatusInfo>) => void
}

const defaultSyncStatus: SyncStatusInfo = {
  enabled: false,
  authenticated: false,
  lastSync: null,
  synced: 0,
  needsSync: 0,
  inProgress: false,
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  accessToken: null,
  syncStatus: defaultSyncStatus,

  loadFromStorage: () => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    const userRaw = localStorage.getItem(USER_KEY)
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw)
        set({
          user,
          isAuthenticated: true,
          accessToken: token,
          syncStatus: { ...defaultSyncStatus, enabled: true, authenticated: true },
        })
      } catch {}
    }
  },

  login: async (email, password) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || 'Login failed')
    }
    const data = await res.json()
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    set({
      user: data.user,
      isAuthenticated: true,
      accessToken: data.accessToken,
      syncStatus: { ...defaultSyncStatus, enabled: true, authenticated: true },
    })
  },

  register: async (name, email, password) => {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || 'Registration failed')
    }
    const data = await res.json()
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    set({
      user: data.user,
      isAuthenticated: true,
      accessToken: data.accessToken,
      syncStatus: { ...defaultSyncStatus, enabled: true, authenticated: true },
    })
  },

  logout: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ user: null, isAuthenticated: false, accessToken: null, syncStatus: defaultSyncStatus })
  },

  refreshAccessToken: async () => {
    if (typeof window === 'undefined') return false
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshToken) return false
    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) return false
      const data = await res.json()
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
      set({ accessToken: data.accessToken })
      return true
    } catch {
      return false
    }
  },

  syncNow: async () => {
    const { accessToken } = get()
    if (!accessToken) return
    set((s) => ({ syncStatus: { ...s.syncStatus, inProgress: true } }))
    try {
      const sermons = JSON.parse(localStorage.getItem('mountBuilderSermons') || '[]')
      const needsSync = sermons.filter((s: any) => s.needsSync)
      for (const sermon of needsSync) {
        await fetch(`/api/v1/sermons/${sermon.cloudId || ''}`, {
          method: sermon.cloudId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(sermon),
        })
      }
      const now = new Date().toISOString()
      set((s) => ({
        syncStatus: {
          ...s.syncStatus,
          inProgress: false,
          lastSync: now,
          needsSync: 0,
          synced: sermons.length,
        },
      }))
    } catch {
      set((s) => ({ syncStatus: { ...s.syncStatus, inProgress: false } }))
    }
  },

  uploadAllToCloud: async () => {
    const { accessToken } = get()
    if (!accessToken) return
    const sermons = JSON.parse(localStorage.getItem('mountBuilderSermons') || '[]')
    await fetch('/api/v1/sermons/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ sermons }),
    })
  },

  setSyncStatus: (status) =>
    set((s) => ({ syncStatus: { ...s.syncStatus, ...status } })),
}))
