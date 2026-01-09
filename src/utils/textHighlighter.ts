export interface TextHighlight {
  start: number
  end: number
  type: 'passive' | 'adverb' | 'keyword' | 'complex'
  text: string
  suggestion?: string
}

const PASSIVE_VOICE_PATTERNS = [
  /\b(am|is|are|was|were|be|been|being)\s+(\w+ed|gotten|given|taken|made|done|gone|seen|known|written)\b/gi,
  /\b(am|is|are|was|were|be|been|being)\s+(able|unable)\s+to\b/gi,
]

const ADVERB_PATTERN = /\b\w+ly\b/g

// Set of common non-adverbs ending in 'ly' for faster lookup
const NON_ADVERBS = new Set(['only', 'early', 'daily', 'holy', 'ugly', 'family', 'supply', 'apply', 'reply', 'likely', 'lovely', 'lonely', 'friendly'])

const COMPLEX_SENTENCE_LENGTH = 25 // words

// HTML escape map for faster escaping
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export class TextHighlighter {
  /**
   * Detect all highlights in the text
   */
  static detectHighlights(text: string, keywordDensity?: Array<{ word: string; density: number; status: string }>): TextHighlight[] {
    if (!text) return []

    const highlights: TextHighlight[] = []

    // Detect passive voice
    PASSIVE_VOICE_PATTERNS.forEach(pattern => {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        if (match.index !== undefined) {
          highlights.push({
            start: match.index,
            end: match.index + match[0].length,
            type: 'passive',
            text: match[0],
            suggestion: 'Consider using active voice for stronger writing',
          })
        }
      }
    })

    // Detect adverbs (optimized with Set lookup)
    const adverbMatches = text.matchAll(ADVERB_PATTERN)
    for (const match of adverbMatches) {
      if (match.index !== undefined) {
        const word = match[0].toLowerCase()
        // Filter out common non-adverbs using Set for O(1) lookup
        if (!NON_ADVERBS.has(word)) {
          highlights.push({
            start: match.index,
            end: match.index + match[0].length,
            type: 'adverb',
            text: match[0],
            suggestion: 'Consider removing or replacing this adverb for stronger writing',
          })
        }
      }
    }

    // Detect critical keywords
    if (keywordDensity) {
      const criticalKeywords = keywordDensity
        .filter(kw => kw.status === 'critical')
        .map(kw => kw.word.toLowerCase())

      criticalKeywords.forEach(keyword => {
        const pattern = new RegExp(`\\b${keyword}\\b`, 'gi')
        const matches = text.matchAll(pattern)
        for (const match of matches) {
          if (match.index !== undefined) {
            highlights.push({
              start: match.index,
              end: match.index + match[0].length,
              type: 'keyword',
              text: match[0],
              suggestion: `This keyword is overused (>5% density). Consider using synonyms`,
            })
          }
        }
      })
    }

    // Detect complex sentences (optimized to avoid redundant indexOf)
    const sentencePattern = /[^.!?]+[.!?]+/g
    const sentenceMatches = text.matchAll(sentencePattern)

    for (const match of sentenceMatches) {
      if (match.index !== undefined) {
        const sentence = match[0].trim()
        const wordCount = sentence.split(/\s+/).length

        if (wordCount > COMPLEX_SENTENCE_LENGTH && sentence.length > 0) {
          highlights.push({
            start: match.index,
            end: match.index + match[0].length,
            type: 'complex',
            text: sentence,
            suggestion: `This sentence has ${wordCount} words. Consider breaking it into shorter sentences`,
          })
        }
      }
    }

    // Sort by start position
    return highlights.sort((a, b) => a.start - b.start)
  }

  /**
   * Generate HTML with highlighted spans
   */
  static generateHighlightedHTML(text: string, highlights: TextHighlight[]): string {
    if (!text || highlights.length === 0) {
      return this.escapeHtml(text)
    }

    let result = ''
    let lastIndex = 0

    // Remove overlapping highlights (keep first one)
    const nonOverlapping = this.removeOverlaps(highlights)

    nonOverlapping.forEach(highlight => {
      // Add text before highlight
      result += this.escapeHtml(text.substring(lastIndex, highlight.start))

      // Add highlighted text
      const className = this.getHighlightClass(highlight.type)
      result += `<mark class="${className}" data-tooltip="${this.escapeHtml(highlight.suggestion || '')}">${this.escapeHtml(highlight.text)}</mark>`

      lastIndex = highlight.end
    })

    // Add remaining text
    result += this.escapeHtml(text.substring(lastIndex))

    return result
  }

  private static removeOverlaps(highlights: TextHighlight[]): TextHighlight[] {
    const result: TextHighlight[] = []
    let lastEnd = -1

    highlights.forEach(highlight => {
      if (highlight.start >= lastEnd) {
        result.push(highlight)
        lastEnd = highlight.end
      }
    })

    return result
  }

  private static getHighlightClass(type: string): string {
    switch (type) {
      case 'passive':
        return 'highlight-passive'
      case 'adverb':
        return 'highlight-adverb'
      case 'keyword':
        return 'highlight-keyword'
      case 'complex':
        return 'highlight-complex'
      default:
        return ''
    }
  }

  private static escapeHtml(text: string): string {
    // Optimized HTML escaping without DOM creation
    return text.replace(/[&<>"']/g, char => HTML_ESCAPE_MAP[char] || char)
  }
}
