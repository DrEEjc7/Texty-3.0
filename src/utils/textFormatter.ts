import DOMPurify from 'isomorphic-dompurify'

export class TextFormatter {
  static stripFormatting(text: string): string {
    if (!text) return ''

    if (!text.includes('<')) {
      return text
        .replace(/[ \t]+/g, ' ')
        .replace(/[ \t]*\n[ \t]*/g, '\n')
        .trim()
    }

    text = text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
      .replace(/<li[^>]*>/gi, '\n• ')
      .replace(/<\/li>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n')

    // Sanitize HTML to prevent XSS
    const sanitizedHTML = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
    const tempDiv = document.createElement('div')
    tempDiv.textContent = sanitizedHTML

    let cleanText = tempDiv.textContent || ''

    cleanText = cleanText
      .replace(/[ \t]+/g, ' ')
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      .replace(/\n{4,}/g, '\n\n\n')
      .trim()

    return cleanText
  }

  static autoFormat(text: string): string {
    if (!text || !text.trim()) return ''

    const paragraphs = text.split(/\n\s*\n/)

    const formatLine = (line: string) => {
      return line
        .replace(/[ \t]+/g, ' ')
        .trim()
        .replace(/\s+([,.!?;:])/g, '$1')
        .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
        .replace(/(^|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase())
        .replace(/\bi\b/g, 'I')
        .replace(/\s+'/g, "'")
        .replace(/'\s+/g, "'")
    }

    return paragraphs
      .map((paragraph) => {
        const lines = paragraph.split('\n')
        return lines
          .map((line) => (line.trim() ? formatLine(line) : ''))
          .filter((line) => line !== '')
          .join('\n')
      })
      .filter(Boolean)
      .join('\n\n')
  }
}

export class CaseConverter {
  static convert(text: string, caseType: 'upper' | 'lower' | 'title' | 'sentence'): string {
    if (!text) return ''

    switch (caseType) {
      case 'upper':
        return text.toUpperCase()
      case 'lower':
        return text.toLowerCase()
      case 'title':
        return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
      case 'sentence':
        return text.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase())
      default:
        return text
    }
  }
}
