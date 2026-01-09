import type { TextStats, KeywordDensity, ReadabilityScores, WritingStyle } from '@/features/text/types'
import { STOP_WORDS } from './stopWords'
import { LRUCache } from './lruCache'

// Compiled Regex Patterns
const RE_SPLIT_WORDS = /\s+/
const RE_SPLIT_SENTENCES = /[.!?]+\s+|[.!?]+$/
const RE_SPLIT_PARAGRAPHS = /\n\s*\n/
const RE_CLEAN_WORD = /[^\w]/g
const RE_DIGITS_ONLY = /^\d+$/
const RE_IS_ADVERB = /ly$/i
const RE_PASSIVE_VOICE = /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi
const RE_COMPLEX_SENTENCE_COMMA = /,/g
const RE_COMPLEX_SENTENCE_WORDS = /\b(although|however|because|therefore)\b/i
const RE_SYLLABLE_CLEAN_END = /(?:[^laeiouy]es|ed|[^laeiouy]e)$/
const RE_SYLLABLE_START_Y = /^y/
const RE_VOWELS = /[aeiouy]{1,2}/g

class TextAnalyzerUtil {
  private syllableCache = new LRUCache<string, number>(2000) // LRU cache with 2000 capacity

  analyze(text: string): TextStats {
    if (!text?.trim()) return this.getEmptyStats()

    const trimmedText = text.trim()
    const words = trimmedText.split(RE_SPLIT_WORDS)
    const sentences = text.split(RE_SPLIT_SENTENCES).filter(s => s.trim())
    const paragraphs = text.split(RE_SPLIT_PARAGRAPHS).filter(p => p.trim())
    const wordCount = words.length
    const sentenceCount = sentences.length

    const readability = this.calculateReadability(words, sentences, text.length)
    const writingStyle = this.analyzeWritingStyle(text, words, sentences)
    const keywordDensity = wordCount > 10 ? this.calculateKeywordDensity(words) : []
    const seoScore = this.calculateSEOScore(keywordDensity, readability.flesch, writingStyle)

    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size
    const avgWordLength = wordCount > 0
      ? (words.reduce((sum, w) => sum + w.length, 0) / wordCount).toFixed(1)
      : '—'

    return {
      words: wordCount,
      uniqueWords,
      characters: text.length,
      sentences: sentenceCount,
      paragraphs: paragraphs.length,
      avgWordLength,
      readingTime: this.calculateReadingTime(wordCount),
      fleschScore: Math.round(readability.flesch),
      gradeLevel: readability.fleschGrade,
      keywords: wordCount > 20 ? this.extractKeywords(words, 7) : [],
      keywordDensity,
      readability,
      writingStyle,
      seoScore,
    }
  }

  private calculateKeywordDensity(words: string[]): KeywordDensity[] {
    const wordCount: Record<string, number> = {}
    const totalWords = words.length

    for (const word of words) {
      const clean = word.toLowerCase().replace(RE_CLEAN_WORD, '')
      if (clean.length > 2 && !STOP_WORDS.has(clean) && !RE_DIGITS_ONLY.test(clean)) {
        wordCount[clean] = (wordCount[clean] || 0) + 1
      }
    }

    return Object.entries(wordCount)
      .filter(([_, count]) => count >= 2)
      .map(([word, count]) => {
        const density = (count / totalWords) * 100
        const status = density > 5 ? 'critical' : density > 3 ? 'warning' : 'optimal'
        return { word, count, density, status } as KeywordDensity
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
  }

  private calculateReadability(words: string[], sentences: string[], characters: number): ReadabilityScores {
    const wordCount = words.length
    const sentenceCount = sentences.length

    if (wordCount === 0 || sentenceCount === 0) {
      return {
        flesch: 0,
        fleschGrade: '—',
        gunningFog: 0,
        smog: 0,
        colemanLiau: 0,
        automatedReadability: 0,
      }
    }

    const avgWordsPerSentence = wordCount / sentenceCount
    const avgSyllablesPerWord = words.reduce((sum, w) => sum + this.countSyllables(w), 0) / wordCount
    const avgCharsPerWord = characters / wordCount

    // Flesch Reading Ease
    const flesch = Math.max(0, Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord))

    // Gunning Fog
    const complexWords = words.filter(w => this.countSyllables(w) >= 3).length
    const gunningFog = 0.4 * (avgWordsPerSentence + 100 * (complexWords / wordCount))

    // SMOG
    const polysyllables = words.filter(w => this.countSyllables(w) >= 3).length
    const smog = 1.0430 * Math.sqrt(polysyllables * (30 / sentenceCount)) + 3.1291

    // Coleman-Liau
    const L = (characters / wordCount) * 100
    const S = (sentenceCount / wordCount) * 100
    const colemanLiau = 0.0588 * L - 0.296 * S - 15.8

    // ARI
    const automatedReadability = 4.71 * avgCharsPerWord + 0.5 * avgWordsPerSentence - 21.43

    return {
      flesch: Math.round(flesch),
      fleschGrade: this.getGradeLevel(flesch),
      gunningFog: Math.max(0, Math.round(gunningFog * 10) / 10),
      smog: Math.max(0, Math.round(smog * 10) / 10),
      colemanLiau: Math.max(0, Math.round(colemanLiau * 10) / 10),
      automatedReadability: Math.max(0, Math.round(automatedReadability * 10) / 10),
    }
  }

  private analyzeWritingStyle(text: string, words: string[], sentences: string[]): WritingStyle {
    const wordCount = words.length
    const sentenceCount = sentences.length

    if (wordCount === 0 || sentenceCount === 0) {
      return {
        passiveVoicePercentage: 0,
        adverbCount: 0,
        complexSentencePercentage: 0,
        avgSentenceLength: 0,
        toneIndicator: 'neutral',
      }
    }

    const passiveMatches = (text.match(RE_PASSIVE_VOICE) || []).length
    const adverbs = words.filter(w => RE_IS_ADVERB.test(w) && w.length > 4)
    const complexSentences = sentences.filter(s =>
      (s.match(RE_COMPLEX_SENTENCE_COMMA) || []).length >= 2 || RE_COMPLEX_SENTENCE_WORDS.test(s)
    )
    const avgSentenceLength = Math.round(wordCount / sentenceCount)

    const textLower = text.toLowerCase()
    const formalWords = ['therefore', 'thus', 'furthermore', 'moreover', 'consequently', 'nevertheless']
    const casualWords = ['yeah', 'gonna', 'wanna', 'kinda', 'sorta', 'cool', 'awesome', 'really']

    const formalCount = formalWords.filter(w => textLower.includes(w)).length
    const casualCount = casualWords.filter(w => textLower.includes(w)).length

    let toneIndicator: 'formal' | 'neutral' | 'casual' = 'neutral'
    if (formalCount > casualCount && avgSentenceLength > 20) toneIndicator = 'formal'
    else if (casualCount > formalCount || avgSentenceLength < 15) toneIndicator = 'casual'

    return {
      passiveVoicePercentage: Math.round((passiveMatches / sentenceCount) * 100),
      adverbCount: adverbs.length,
      complexSentencePercentage: Math.round((complexSentences.length / sentenceCount) * 100),
      avgSentenceLength,
      toneIndicator,
    }
  }

  private calculateSEOScore(
    keywordDensity: KeywordDensity[],
    fleschScore: number,
    writingStyle: WritingStyle
  ): number {
    let score = 0

    // Keyword density (40 points)
    const optimal = keywordDensity.filter(k => k.status === 'optimal').length
    const critical = keywordDensity.filter(k => k.status === 'critical').length
    score += Math.min(40, optimal * 5) - critical * 10

    // Readability (30 points)
    if (fleschScore >= 60 && fleschScore <= 80) score += 30
    else if (fleschScore >= 50) score += 20
    else if (fleschScore >= 40) score += 10

    // Writing style (30 points)
    if (writingStyle.passiveVoicePercentage < 20) score += 10
    if (writingStyle.adverbCount < 5) score += 10
    if (writingStyle.avgSentenceLength >= 15 && writingStyle.avgSentenceLength <= 25) score += 10

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private extractKeywords(words: string[], count: number): string[] {
    const wordCount: Record<string, number> = {}

    for (const word of words) {
      const clean = word.toLowerCase().replace(RE_CLEAN_WORD, '')
      if (clean.length > 2 && !STOP_WORDS.has(clean) && !RE_DIGITS_ONLY.test(clean)) {
        wordCount[clean] = (wordCount[clean] || 0) + 1
      }
    }

    return Object.entries(wordCount)
      .filter(([_, freq]) => freq >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([word]) => word)
  }

  private countSyllables(word: string): number {
    if (!word) return 0

    const clean = word.toLowerCase().trim()

    // Check cache first
    const cached = this.syllableCache.get(clean)
    if (cached !== undefined) return cached

    // Calculate syllable count
    let count: number
    if (RE_DIGITS_ONLY.test(clean)) count = clean.length
    else if (clean.length <= 3) count = 1
    else {
      const processed = clean.replace(RE_SYLLABLE_CLEAN_END, '').replace(RE_SYLLABLE_START_Y, '')
      const matches = processed.match(RE_VOWELS)
      count = Math.max(1, matches ? matches.length : 1)
    }

    // LRU cache automatically handles eviction
    this.syllableCache.set(clean, count)
    return count
  }

  private calculateReadingTime(wordCount: number): string | number {
    if (wordCount === 0) return '0'
    if (wordCount < 100) return '<1'
    return Math.ceil(wordCount / 200)
  }

  private getGradeLevel(score: number): string {
    if (score <= 0 || isNaN(score)) return '—'
    if (score >= 100) return 'Pre-school'
    if (score >= 90) return '5th Grade'
    if (score >= 80) return '6th Grade'
    if (score >= 70) return '7th Grade'
    if (score >= 60) return '8th-9th Grade'
    if (score >= 50) return '10th-12th Grade'
    if (score >= 30) return 'College'
    return 'Graduate'
  }

  private getEmptyStats(): TextStats {
    return {
      words: 0,
      uniqueWords: 0,
      characters: 0,
      sentences: 0,
      paragraphs: 0,
      avgWordLength: '—',
      readingTime: 0,
      fleschScore: 0,
      gradeLevel: '—',
      keywords: [],
      keywordDensity: [],
      readability: {
        flesch: 0,
        fleschGrade: '—',
        gunningFog: 0,
        smog: 0,
        colemanLiau: 0,
        automatedReadability: 0,
      },
      writingStyle: {
        passiveVoicePercentage: 0,
        adverbCount: 0,
        complexSentencePercentage: 0,
        avgSentenceLength: 0,
        toneIndicator: 'neutral',
      },
      seoScore: 0,
    }
  }
}

export const textAnalyzer = new TextAnalyzerUtil()
