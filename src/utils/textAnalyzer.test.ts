import { describe, it, expect } from 'vitest'
import { textAnalyzer } from './textAnalyzer'

describe('TextAnalyzerUtil', () => {
  describe('analyze', () => {
    it('should return empty stats for empty input', () => {
      const result = textAnalyzer.analyze('')
      expect(result.words).toBe(0)
      expect(result.characters).toBe(0)
      expect(result.sentences).toBe(0)
      expect(result.readingTime).toBe(0)
    })

    it('should correctly count words and characters', () => {
      const text = 'Hello world. This is a test.'
      const result = textAnalyzer.analyze(text)
      
      expect(result.words).toBe(6)
      expect(result.characters).toBe(text.length)
      expect(result.sentences).toBe(2)
    })

    it('should correctly calculate reading time', () => {
      // 200 words should be exactly 1 minute
      const text = Array(200).fill('word').join(' ')
      const result = textAnalyzer.analyze(text)
      expect(result.readingTime).toBe(1)
      
      // 400 words should be 2 minutes
      const text2 = Array(400).fill('word').join(' ')
      const result2 = textAnalyzer.analyze(text2)
      expect(result2.readingTime).toBe(2)
    })

    it('should identify keywords correctly', () => {
      const text = 'SEO SEO SEO optimization optimization keyword'
      const result = textAnalyzer.analyze(text)
      
      // Should find recurring words
      // SEO appears 3 times
      // optimization appears 2 times
      // keyword appears 1 time (should be filtered out by logic usually needing >1 or based on implementation)
      
      // Note: Implementation details of extractKeywords might require wordCount > 20 based on previous code reading
      // Let's test with a longer text to trigger keyword extraction
      const longText = `
        Search engine optimization (SEO) is important. 
        SEO helps websites rank better. 
        Good SEO practices improve visibility.
        Optimization is key for success.
        Optimization requires patience.
        Keywords are part of SEO.
        Content is king in SEO.
      ` + Array(20).fill('filler').join(' ') 

      const resultWithKeywords = textAnalyzer.analyze(longText)
      expect(resultWithKeywords.keywords).toContain('seo')
      expect(resultWithKeywords.keywords).toContain('optimization')
    })
    
    it('should calculate Flesch reading ease', () => {
      // "The cat sat on the mat."
      // Simple sentence, should have high readability score
      const simpleText = 'The cat sat on the mat.'
      const result = textAnalyzer.analyze(simpleText)
      
      // High score = easy to read (usually 90-100 for this simple)
      expect(result.fleschScore).toBeGreaterThan(60)
      
      // Complex academic text
      const complexText = 'The implementation of the mitigating circumstances regarding the fundamental dichotomy of the philosophical paradox requires extensive analysis.'
      const complexResult = textAnalyzer.analyze(complexText)
      
      // Low score = difficult to read
      expect(complexResult.fleschScore).toBeLessThan(result.fleschScore)
    })
  })
})
