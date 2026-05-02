export type Theme = 'light' | 'dark' | 'sepia'
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge'
export type Translation = 'WEB' | 'KJV' | 'NKJV' | 'ESV' | 'NLT' | 'ASV' | 'BBE'
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success'

export interface SermonSection {
  id: string
  heading: string
  scripture: string
  notes: string
}

export interface Sermon {
  id: number
  title: string
  speaker: string
  date: string
  series: string
  verseReference: string
  verseData: VerseData | null
  notes: string
  tags: string[]
  sections: SermonSection[]
  createdAt: string
  lastModified: string
  // cloud sync fields
  cloudId?: string
  lastSynced?: string
  needsSync?: boolean
}

export interface VerseData {
  reference: string
  text: string
  translation: string
}

export interface BibleVerse {
  book_name?: string
  chapter?: number
  verse: number
  text: string
  markup?: string // HTML from Bolls API — preserves red-letter Jesus words
}

export interface BibleChapter {
  reference: string
  verses: BibleVerse[]
  translation: string
}

export interface BibleBook {
  name: string
  chapters: number
}

export interface HighlightedVerse {
  reference: string
  color: string
}

export interface SermonTemplate {
  id: string
  name: string
  description: string
  sections: Pick<SermonSection, 'heading' | 'scripture' | 'notes'>[]
}

export interface User {
  id: number
  name: string
  email: string
  createdAt: string
  lastLogin?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface SyncStatusInfo {
  enabled: boolean
  authenticated: boolean
  lastSync: string | null
  synced: number
  needsSync: number
  inProgress: boolean
}

export interface TagStats {
  tag: string
  count: number
  color: string
}

export interface SearchResult {
  sermon: Sermon
  score: number
  highlights: Record<string, string>
}

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  sermons: Sermon[]
}

export interface PerformanceMetrics {
  lcp: number | null
  fid: number | null
  cls: number | null
  pageViews: number
  errorCount: number
}

export interface BibleCacheEntry {
  data: BibleChapter
  cachedAt: number
  lastAccessed: number
  translation: Translation
}
