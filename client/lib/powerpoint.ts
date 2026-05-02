import type { Sermon, SermonSection } from '@/types'

type PPTXTheme = 'classic' | 'peaceful' | 'hope'

const THEMES = {
  classic: { title: '4A1942', accent: 'C9A84C', bg: 'FDFAF6' },
  peaceful: { title: '1B4332', accent: '40916C', bg: 'F8FFF8' },
  hope: { title: '6B1B1B', accent: 'C0392B', bg: 'FFF9F9' },
}

export async function generatePowerPoint(sermon: Sermon, theme: PPTXTheme = 'classic') {
  const pptxgenjs = (await import('pptxgenjs')).default
  const pptx = new pptxgenjs()
  const t = THEMES[theme]

  pptx.layout = 'LAYOUT_WIDE'

  // Title slide
  const titleSlide = pptx.addSlide()
  titleSlide.background = { color: t.bg }
  titleSlide.addText('✝', { x: 3.5, y: 0.3, w: 6.5, h: 0.8, fontSize: 36, color: t.accent, align: 'center' })
  titleSlide.addText(sermon.title || 'Sermon', {
    x: 0.5, y: 1.2, w: 12.5, h: 1.5, fontSize: 40, bold: true,
    color: t.title, align: 'center',
  })
  if (sermon.verseReference) {
    titleSlide.addText(sermon.verseReference, {
      x: 0.5, y: 2.8, w: 12.5, h: 0.6, fontSize: 20, italic: true,
      color: t.accent, align: 'center',
    })
  }
  titleSlide.addText(
    [sermon.speaker, sermon.date, sermon.series].filter(Boolean).join('  ·  '),
    { x: 0.5, y: 3.6, w: 12.5, h: 0.5, fontSize: 14, color: '666666', align: 'center' }
  )

  // Section slides
  for (const section of sermon.sections || []) {
    const slide = pptx.addSlide()
    slide.background = { color: t.bg }
    slide.addText(section.heading || 'Section', {
      x: 0.5, y: 0.4, w: 12.5, h: 0.8, fontSize: 28, bold: true, color: t.title,
    })
    if (section.scripture) {
      slide.addText(section.scripture, {
        x: 0.5, y: 1.3, w: 12.5, h: 0.4, fontSize: 16, italic: true, color: t.accent,
      })
    }
    if (section.notes) {
      const bullets = section.notes.split('\n').filter(Boolean).map((line) => ({
        text: line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, ''),
        options: { bullet: true, fontSize: 18, color: '333333' },
      }))
      slide.addText(bullets, { x: 0.5, y: section.scripture ? 2.0 : 1.5, w: 12.5, h: 4.5 })
    }
  }

  // Closing slide
  const closing = pptx.addSlide()
  closing.background = { color: t.bg }
  closing.addText('Thank You', { x: 0.5, y: 2.5, w: 12.5, h: 1, fontSize: 36, bold: true, color: t.title, align: 'center' })

  const filename = `${(sermon.title || 'sermon').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pptx`
  await pptx.writeFile({ fileName: filename })
}
