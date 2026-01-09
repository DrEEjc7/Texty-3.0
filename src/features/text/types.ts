export interface KeywordDensity {
  word: string
  count: number
  density: number
  status: 'optimal' | 'warning' | 'critical'
}

export interface ReadabilityScores {
  flesch: number
  fleschGrade: string
  gunningFog: number
  smog: number
  colemanLiau: number
  automatedReadability: number
}

export interface WritingStyle {
  passiveVoicePercentage: number
  adverbCount: number
  complexSentencePercentage: number
  avgSentenceLength: number
  toneIndicator: 'formal' | 'neutral' | 'casual'
}

export interface TextStats {
  words: number
  uniqueWords: number
  characters: number
  sentences: number
  paragraphs: number
  avgWordLength: string
  readingTime: string | number
  fleschScore: number
  gradeLevel: string
  keywords: string[]
  keywordDensity: KeywordDensity[]
  readability: ReadabilityScores
  writingStyle: WritingStyle
  seoScore: number
}

export interface FormattingInfo {
  fonts: string[]
  sizes: string[]
  weights: string[]
  colors: string[]
  styles: string[]
  elements: string[]
  hasFormatting: boolean
}

export interface LoremConfig {
  type: 'paragraphs' | 'sentences' | 'words'
  count: number
  style: 'latin' | 'english' | 'tech' | 'business'
}
