'use client'

import { Trash2, GripVertical } from 'lucide-react'
import type { SermonSection as SermonSectionType } from '@/types'

interface SermonSectionProps {
  section: SermonSectionType
  index: number
  onChange: (id: string, field: keyof SermonSectionType, value: string) => void
  onDelete: (id: string) => void
}

export function SermonSectionCard({ section, index, onChange, onDelete }: SermonSectionProps) {
  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex items-center gap-2">
        <GripVertical size={16} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: 'var(--accent-primary)' }}
        >
          Section {index + 1}
        </span>
        <button
          type="button"
          onClick={() => onDelete(section.id)}
          className="ml-auto p-1.5 rounded-lg"
          style={{ color: '#dc2626' }}
          aria-label="Delete section"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <input
        type="text"
        value={section.heading}
        onChange={(e) => onChange(section.id, 'heading', e.target.value)}
        placeholder="Section heading…"
        className="w-full px-3 py-2 rounded-lg border text-sm font-medium bg-transparent"
        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
      />

      <input
        type="text"
        value={section.scripture}
        onChange={(e) => onChange(section.id, 'scripture', e.target.value)}
        placeholder="Scripture reference (e.g. John 3:16)"
        className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent"
        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
      />

      <textarea
        value={section.notes}
        onChange={(e) => onChange(section.id, 'notes', e.target.value)}
        placeholder="Notes for this section…"
        rows={4}
        className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent resize-y"
        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
      />
    </div>
  )
}
