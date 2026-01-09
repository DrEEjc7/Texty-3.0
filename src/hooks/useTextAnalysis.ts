import { useEffect, useRef } from 'react'
import { useTextStore } from '@/store/textStore'
import { textAnalyzer } from '@/utils/textAnalyzer'

export function useTextAnalysis() {
  const { text, setStats } = useTextStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    const delay = text.length > 10000 ? 500 : text.length > 5000 ? 350 : 250

    timerRef.current = setTimeout(() => {
      const stats = textAnalyzer.analyze(text)
      setStats(stats)
    }, delay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [text, setStats])
}
