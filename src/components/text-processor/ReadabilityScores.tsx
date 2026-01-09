import { useTextStore } from '@/store/textStore'

export function ReadabilityScores() {
  const { stats } = useTextStore()

  if (stats.words === 0) return null

  const scores = [
    { label: 'Flesch Reading Ease', value: stats.readability.flesch, grade: stats.readability.fleschGrade },
    { label: 'Gunning Fog', value: stats.readability.gunningFog, desc: 'Years of education' },
    { label: 'SMOG Index', value: stats.readability.smog, desc: 'Gobbledygook measure' },
    { label: 'Coleman-Liau', value: stats.readability.colemanLiau, desc: 'Character-based' },
    { label: 'Auto Readability', value: stats.readability.automatedReadability, desc: 'ARI score' },
  ]

  return (
    <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
      <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
        Advanced Readability Analysis
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scores.map((score) => (
          <div
            key={score.label}
            className="border border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-bg-primary)]"
          >
            <div className="text-xs text-[var(--color-text-secondary)] mb-1">{score.label}</div>
            <div className="text-2xl font-bold text-[var(--color-text-primary)]">{score.value}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">
              {score.grade || score.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
