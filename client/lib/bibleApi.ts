import type { BibleChapter, BibleVerse, Translation } from '@/types'

const CACHE_KEY = 'bibleChapterCache'
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000 // 30 days
const CACHE_MAX = 500

interface CacheEntry {
  data: BibleChapter
  cachedAt: number
  lastAccessed: number
}

function readCache(): Record<string, CacheEntry> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeCache(cache: Record<string, CacheEntry>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // QuotaExceededError: evict oldest 50%
    const entries = Object.entries(cache).sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
    const trimmed = Object.fromEntries(entries.slice(Math.floor(entries.length / 2)))
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed)) } catch {}
  }
}

function cacheGet(key: string): BibleChapter | null {
  const cache = readCache()
  const entry = cache[key]
  if (!entry) return null
  if (Date.now() - entry.cachedAt > CACHE_TTL) {
    delete cache[key]
    writeCache(cache)
    return null
  }
  entry.lastAccessed = Date.now()
  writeCache(cache)
  return entry.data
}

function cacheSet(key: string, data: BibleChapter) {
  const cache = readCache()
  const keys = Object.keys(cache)
  if (keys.length >= CACHE_MAX) {
    const oldest = keys.sort((a, b) => cache[a].lastAccessed - cache[b].lastAccessed)[0]
    delete cache[oldest]
  }
  cache[key] = { data, cachedAt: Date.now(), lastAccessed: Date.now() }
  writeCache(cache)
}

const PRIMARY_TRANSLATIONS: Translation[] = ['WEB', 'KJV', 'ASV', 'BBE']
const SECONDARY_TRANSLATIONS: Translation[] = ['NKJV', 'ESV', 'NLT']

function capitalizeGod(text: string): string {
  return text.replace(/\bgod\b/gi, (match) => match === 'god' ? 'God' : match)
}

// Bolls API wraps Jesus's words in <J>...</J> tags — convert to styled spans
function processRedLetterMarkup(raw: string): string {
  return capitalizeGod(
    raw.replace(/<J>([\s\S]*?)<\/J>/g, '<span class="red-letter">$1</span>')
       .replace(/<[^>]+>/g, '') // strip any remaining unknown tags
  )
}

async function fetchFromBibleApi(book: string, chapter: number, translation: Translation): Promise<BibleChapter> {
  const ref = `${encodeURIComponent(book)}+${chapter}`
  const url = `https://bible-api.com/${ref}?translation=${translation.toLowerCase()}`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`Bible API error: ${res.status}`)
  const data = await res.json()
  return {
    reference: data.reference,
    verses: data.verses.map((v: any) => {
      const text = capitalizeGod(v.text.trim())
      return { verse: v.verse, text }
    }),
    translation,
  }
}

async function fetchFromBolls(book: string, chapter: number, translation: Translation): Promise<BibleChapter> {
  const url = `https://bolls.life/get-chapter/${translation}/${encodeURIComponent(book)}/${chapter}/`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`Bolls API error: ${res.status}`)
  const data = await res.json()
  const verses: BibleVerse[] = data.map((v: any, i: number) => {
    const markup = processRedLetterMarkup(v.text)
    const text = markup.replace(/<[^>]+>/g, '').trim()
    return { verse: i + 1, text, markup }
  })
  return {
    reference: `${book} ${chapter}`,
    verses,
    translation,
  }
}

export async function fetchChapter(
  book: string,
  chapter: number,
  translation: Translation
): Promise<BibleChapter> {
  const key = `${book}|${chapter}|${translation}`.toLowerCase()
  const cached = cacheGet(key)
  if (cached) return cached

  let data: BibleChapter
  if (PRIMARY_TRANSLATIONS.includes(translation)) {
    data = await fetchFromBibleApi(book, chapter, translation)
  } else {
    try {
      data = await fetchFromBolls(book, chapter, translation)
    } catch {
      // Bolls API unavailable — fall back to WEB via bible-api.com
      data = await fetchFromBibleApi(book, chapter, 'WEB')
      data = { ...data, translation }
    }
  }

  cacheSet(key, data)
  return data
}

export async function fetchVerse(reference: string, translation: Translation = 'WEB'): Promise<string> {
  const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=${translation.toLowerCase()}`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error('Verse not found')
  const data = await res.json()
  return data.text?.trim() ?? ''
}

export function getCacheStats() {
  const cache = readCache()
  const entries = Object.values(cache)
  const hits = parseInt(localStorage.getItem('bibleCacheHits') || '0')
  const total = parseInt(localStorage.getItem('bibleCacheTotal') || '1')
  return {
    entries: entries.length,
    hitRate: Math.round((hits / total) * 100),
  }
}

export function clearCache() {
  localStorage.removeItem(CACHE_KEY)
}
