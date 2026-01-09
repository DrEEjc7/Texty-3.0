import type { LoremConfig } from '@/features/text/types'

export class LoremGenerator {
  private static libraries = {
    latin: [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    ],
    english: [
      'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'beautiful',
      'landscape', 'mountain', 'river', 'forest', 'sunshine', 'peaceful', 'journey',
      'adventure', 'discover', 'explore', 'amazing', 'wonderful', 'incredible',
    ],
    tech: [
      'algorithm', 'database', 'framework', 'application', 'interface', 'protocol',
      'cloud', 'microservices', 'container', 'kubernetes', 'docker', 'api',
      'scalability', 'performance', 'infrastructure', 'deployment', 'optimization',
    ],
    business: [
      'strategy', 'growth', 'innovation', 'market', 'customer', 'revenue', 'profit',
      'investment', 'portfolio', 'stakeholder', 'partnership', 'collaboration',
      'efficiency', 'productivity', 'transformation', 'competitive', 'advantage',
    ],
  }

  static generate(config: LoremConfig): string {
    const library = this.libraries[config.style] || this.libraries.english

    if (config.type === 'words') return this.generateWords(config.count, library)
    if (config.type === 'sentences') return this.generateSentences(config.count, library)
    return this.generateParagraphs(config.count, library)
  }

  private static generateWords(count: number, lib: string[]): string {
    const words: string[] = []
    for (let i = 0; i < count; i++) {
      words.push(lib[Math.floor(Math.random() * lib.length)])
    }
    return words.join(' ') + '.'
  }

  private static generateSentences(count: number, lib: string[]): string {
    const sentences: string[] = []
    for (let i = 0; i < count; i++) {
      const wordCount = Math.floor(Math.random() * 12) + 5
      const words: string[] = []
      for (let j = 0; j < wordCount; j++) {
        words.push(lib[Math.floor(Math.random() * lib.length)])
      }
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
      sentences.push(words.join(' ') + '.')
    }
    return sentences.join(' ')
  }

  private static generateParagraphs(count: number, lib: string[]): string {
    const paragraphs: string[] = []
    for (let i = 0; i < count; i++) {
      const sentenceCount = Math.floor(Math.random() * 5) + 3
      paragraphs.push(this.generateSentences(sentenceCount, lib))
    }
    return paragraphs.join('\n\n')
  }
}
