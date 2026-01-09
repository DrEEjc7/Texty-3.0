import { useTextStore } from '@/store/textStore'

export function WritingStyleAnalysis() {
  const { stats } = useTextStore()

  if (stats.words === 0) return null

  const toneColor =
    stats.writingStyle.toneIndicator === 'formal'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      : stats.writingStyle.toneIndicator === 'casual'
        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'

  return (
    <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
      <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
        Writing Style & Tone
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-bg-primary)]">
          <div className="text-xs text-[var(--color-text-secondary)] mb-2">Tone</div>
          <div className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${toneColor}`}>
            {stats.writingStyle.toneIndicator.toUpperCase()}
          </div>
        </div>

        <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-bg-primary)]">
          <div className="text-xs text-[var(--color-text-secondary)] mb-1">Passive Voice</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">
              {stats.writingStyle.passiveVoicePercentage}%
            </span>
            {stats.writingStyle.passiveVoicePercentage < 20 && (
              <span className="text-green-600 dark:text-green-400 text-xs">✓ Good</span>
            )}
            {stats.writingStyle.passiveVoicePercentage >= 20 &&
              stats.writingStyle.passiveVoicePercentage < 40 && (
                <span className="text-yellow-600 dark:text-yellow-400 text-xs">⚠ High</span>
              )}
            {stats.writingStyle.passiveVoicePercentage >= 40 && (
              <span className="text-red-600 dark:text-red-400 text-xs">✗ Too High</span>
            )}
          </div>
        </div>

        <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-bg-primary)]">
          <div className="text-xs text-[var(--color-text-secondary)] mb-1">Adverbs Used</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">
              {stats.writingStyle.adverbCount}
            </span>
            {stats.writingStyle.adverbCount < 5 && (
              <span className="text-green-600 dark:text-green-400 text-xs">✓ Good</span>
            )}
            {stats.writingStyle.adverbCount >= 5 && stats.writingStyle.adverbCount < 10 && (
              <span className="text-yellow-600 dark:text-yellow-400 text-xs">⚠ Many</span>
            )}
            {stats.writingStyle.adverbCount >= 10 && (
              <span className="text-red-600 dark:text-red-400 text-xs">✗ Too Many</span>
            )}
          </div>
        </div>

        <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-bg-primary)]">
          <div className="text-xs text-[var(--color-text-secondary)] mb-1">Complex Sentences</div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">
            {stats.writingStyle.complexSentencePercentage}%
          </div>
        </div>

        <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-bg-primary)]">
          <div className="text-xs text-[var(--color-text-secondary)] mb-1">Avg Sentence Length</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">
              {stats.writingStyle.avgSentenceLength}
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">words</span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-[var(--color-text-muted)] italic">
        Aim for: Passive voice &lt;20%, Minimal adverbs, Avg sentence 15-25 words
      </div>
    </div>
  )
}
