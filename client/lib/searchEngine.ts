import type { Sermon } from '@/types'

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function fuzzyMatch(term: string, target: string, threshold = 0.8): boolean {
  if (!term || !target) return false
  const t = term.toLowerCase(), tg = target.toLowerCase()
  if (tg.includes(t)) return true
  const words = tg.split(/\s+/)
  return words.some((w) => {
    const maxLen = Math.max(t.length, w.length)
    return maxLen === 0 || 1 - levenshtein(t, w) / maxLen >= threshold
  })
}

function calculateRelevance(sermon: Sermon, terms: string[]): number {
  let score = 0
  for (const term of terms) {
    if (fuzzyMatch(term, sermon.title)) score += 10
    if (fuzzyMatch(term, sermon.series)) score += 7
    if (fuzzyMatch(term, sermon.verseReference)) score += 8
    if (fuzzyMatch(term, sermon.speaker)) score += 5
    if (fuzzyMatch(term, sermon.notes)) score += 3
    sermon.sections?.forEach((s) => {
      if (fuzzyMatch(term, s.notes)) score += 2
      if (fuzzyMatch(term, s.heading)) score += 4
    })
    if (sermon.title.toLowerCase().startsWith(term.toLowerCase())) score += 5
  }
  return score
}

export function search(sermons: Sermon[], query: string): Sermon[] {
  if (!query.trim()) return sermons
  const terms = query.trim().toLowerCase().split(/\s+/)
  return sermons
    .map((s) => ({ sermon: s, score: calculateRelevance(s, terms) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.sermon)
}

export function highlight(text: string, query: string): string {
  if (!query.trim() || !text) return text
  const terms = query.trim().split(/\s+/).filter(Boolean)
  let result = text
  terms.forEach((term) => {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    result = result.replace(regex, '<mark class="search-highlight">$1</mark>')
  })
  return result
}

export function getSuggestions(sermons: Sermon[], query: string): string[] {
  if (!query) return []
  const q = query.toLowerCase()
  const suggestions = new Set<string>()
  sermons.forEach((s) => {
    if (s.title.toLowerCase().includes(q)) suggestions.add(s.title)
    if (s.speaker.toLowerCase().includes(q)) suggestions.add(s.speaker)
    if (s.series?.toLowerCase().includes(q)) suggestions.add(s.series)
  })
  return [...suggestions].slice(0, 10)
}
