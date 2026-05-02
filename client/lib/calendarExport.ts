import type { Sermon } from '@/types'

function pad(n: number) { return String(n).padStart(2, '0') }

function toICalDate(dateStr: string, time = '100000'): string {
  const d = new Date(dateStr + 'T10:00:00')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${time}`
}

function escapeIcal(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function createVEvent(sermon: Sermon): string {
  const uid = `${sermon.id}@mountbuilder`
  const start = toICalDate(sermon.date, '100000')
  const end = toICalDate(sermon.date, '110000')
  const description = [
    sermon.speaker && `Speaker: ${sermon.speaker}`,
    sermon.series && `Series: ${sermon.series}`,
    sermon.verseReference && `Scripture: ${sermon.verseReference}`,
    sermon.notes && `Notes: ${sermon.notes.slice(0, 200)}`,
  ].filter(Boolean).join('\\n')

  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcal(sermon.title)}`,
    `DESCRIPTION:${escapeIcal(description)}`,
    sermon.series && `CATEGORIES:${escapeIcal(sermon.series)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${escapeIcal(sermon.title)}`,
    'END:VALARM',
    'END:VEVENT',
  ].filter(Boolean).join('\r\n')
}

function buildIcs(sermons: Sermon[]): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mount Builder//Sermon Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...sermons.map(createVEvent),
    'END:VCALENDAR',
  ].join('\r\n')
}

function downloadIcs(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportAllSermons(sermons: Sermon[]) {
  downloadIcs(buildIcs(sermons), 'mount-builder-sermons.ics')
}

export function exportUpcomingSermons(sermons: Sermon[]) {
  const today = new Date().toISOString().split('T')[0]
  const upcoming = sermons.filter((s) => s.date >= today)
  downloadIcs(buildIcs(upcoming), 'mount-builder-upcoming.ics')
}
