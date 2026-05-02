import type { Sermon, TagStats } from '@/types'

export const PRESET_TAGS: Record<string, string[]> = {
  Topics: ['Salvation', 'Grace', 'Faith', 'Hope', 'Love', 'Prayer', 'Worship', 'Forgiveness', 'Repentance', 'Holy Spirit', 'Baptism', 'Communion', 'Marriage', 'Family', 'Parenting', 'Leadership', 'Stewardship', 'Missions', 'Evangelism', 'Discipleship', 'Suffering', 'Healing', 'Prophecy', 'End Times', 'Heaven', 'Hell', 'Angels', 'Spiritual Warfare', 'Identity', 'Purpose', 'Freedom'],
  Audience: ['Youth', 'Adults', 'Children', 'Senior Saints', 'Men', 'Women', 'Couples', 'Singles', 'New Believers', 'Seekers', 'Leaders', 'Families'],
  Format: ['Expository', 'Topical', 'Narrative', 'Evangelistic', 'Teaching', 'Devotional', 'Series', 'Stand-alone', 'Guest', 'Short', 'Extended', 'Interactive'],
  Seasons: ['Advent', 'Christmas', 'New Year', 'Easter', 'Pentecost', 'Thanksgiving', 'Mother\'s Day', 'Father\'s Day', 'Independence Day', 'Back to School', 'All Saints Day'],
  Themes: ['Transformation', 'Community', 'Justice', 'Mercy', 'Truth', 'Covenant', 'Kingdom', 'Redemption', 'Restoration', 'Provision', 'Protection', 'Promises', 'Obedience', 'Sacrifice', 'Victory', 'Peace'],
}

const TAG_COLORS = [
  '#6b46c1', '#2b6cb0', '#276749', '#9c4221', '#744210',
  '#553c9a', '#2c7a7b', '#c05621', '#285e61', '#702459',
  '#1a365d', '#44337a',
]

export function getTagColor(tag: string): string {
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

export function normalizeTag(tag: string): string {
  return tag.trim().replace(/\b\w/g, (c) => c.toUpperCase())
}

export function getAllTags(sermons: Sermon[]): string[] {
  const tags = new Set<string>()
  sermons.forEach((s) => s.tags?.forEach((t) => tags.add(t)))
  return [...tags].sort()
}

export function getTagStats(sermons: Sermon[]): TagStats[] {
  const counts: Record<string, number> = {}
  sermons.forEach((s) => s.tags?.forEach((t) => { counts[t] = (counts[t] || 0) + 1 }))
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count, color: getTagColor(tag) }))
    .sort((a, b) => b.count - a.count)
}

export function filterByTags(sermons: Sermon[], tags: string[], mode: 'any' | 'all' = 'any'): Sermon[] {
  if (!tags.length) return sermons
  return sermons.filter((s) =>
    mode === 'any'
      ? tags.some((t) => s.tags?.includes(t))
      : tags.every((t) => s.tags?.includes(t))
  )
}

export function getSuggestions(sermons: Sermon[], partial: string): string[] {
  const q = partial.toLowerCase()
  const existing = getAllTags(sermons).filter((t) => t.toLowerCase().includes(q))
  const preset = Object.values(PRESET_TAGS).flat().filter((t) => t.toLowerCase().includes(q))
  return [...new Set([...existing, ...preset])].slice(0, 10)
}
