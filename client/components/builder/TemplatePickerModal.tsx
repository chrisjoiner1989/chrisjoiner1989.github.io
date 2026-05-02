'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { SERMON_TEMPLATES } from '@/lib/sermonTemplates'
import type { SermonTemplate } from '@/types'

interface TemplatePickerModalProps {
  open: boolean
  onClose: () => void
  onSelect: (template: SermonTemplate) => void
}

export function TemplatePickerModal({ open, onClose, onSelect }: TemplatePickerModalProps) {
  const [preview, setPreview] = useState<SermonTemplate | null>(null)

  return (
    <Modal open={open} onClose={onClose} title="Choose a Template" size="md">
      {preview ? (
        <div className="p-4 space-y-4">
          <button
            onClick={() => setPreview(null)}
            className="text-sm font-medium"
            style={{ color: 'var(--accent-primary)' }}
          >
            ← Back to templates
          </button>
          <div>
            <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{preview.name}</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{preview.description}</p>
          </div>
          <div className="space-y-2">
            {preview.sections.map((s, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {i + 1}. {s.heading}
                </p>
                {s.notes && (
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{s.notes}</p>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => { onSelect(preview); onClose() }}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            Use This Template
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {SERMON_TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border p-4 space-y-2"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.description}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t.sections.length} sections</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreview(t)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium border"
                  style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                >
                  Preview
                </button>
                <button
                  onClick={() => { onSelect(t); onClose() }}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Use
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
