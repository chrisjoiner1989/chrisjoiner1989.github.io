'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { X, Tag } from 'lucide-react'
import { getTagColor, getSuggestions, normalizeTag, PRESET_TAGS } from '@/lib/tagSystem'
import type { Sermon } from '@/types'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  sermons?: Sermon[]
}

export function TagInput({ tags, onChange, sermons = [] }: TagInputProps) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showPresets, setShowPresets] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (raw: string) => {
    const tag = normalizeTag(raw)
    if (tag && !tags.includes(tag)) onChange([...tags, tag])
    setInput('')
    setSuggestions([])
  }

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag))

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1])
    }
  }

  const handleInput = (val: string) => {
    setInput(val)
    setSuggestions(val.length >= 1 ? getSuggestions(sermons, val).filter((s) => !tags.includes(s)) : [])
  }

  return (
    <div className="space-y-2">
      <div
        className="flex flex-wrap gap-1.5 min-h-[44px] p-2 rounded-lg border cursor-text"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: getTagColor(tag) }}
          >
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:opacity-70" aria-label={`Remove ${tag}`}>
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={tags.length ? '' : 'Add tags…'}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {suggestions.length > 0 && (
        <ul
          className="rounded-lg border shadow-lg overflow-hidden"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          {suggestions.map((s) => (
            <li key={s}>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:opacity-80 transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onMouseDown={(e) => { e.preventDefault(); addTag(s) }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setShowPresets((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
        style={{ color: 'var(--accent-primary)' }}
      >
        <Tag size={13} />
        {showPresets ? 'Hide preset tags' : 'Browse preset tags'}
      </button>

      {showPresets && (
        <div
          className="rounded-lg border p-3 space-y-3"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
        >
          {Object.entries(PRESET_TAGS).map(([category, presetList]) => (
            <div key={category}>
              <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>{category}</p>
              <div className="flex flex-wrap gap-1.5">
                {presetList.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addTag(t)}
                    disabled={tags.includes(t)}
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white disabled:opacity-40 transition-opacity"
                    style={{ backgroundColor: getTagColor(t) }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
