import { useTextStore } from '@/store/textStore'

export function KeywordDensity() {
  const { stats } = useTextStore()

  if (!stats.keywordDensity || stats.keywordDensity.length === 0 || stats.words === 0) {
    return null
  }

  return (
    <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Keyword Density & SEO
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-secondary)]">SEO Score:</span>
          <span
            className={`text-lg font-bold ${
              stats.seoScore >= 70
                ? 'text-green-600 dark:text-green-400'
                : stats.seoScore >= 40
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-red-600 dark:text-red-400'
            }`}
          >
            {stats.seoScore}/100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {stats.keywordDensity.slice(0, 12).map((keyword) => (
          <div
            key={keyword.word}
            className="border border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-bg-primary)] hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-[var(--color-text-primary)] text-sm">
                {keyword.word}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  keyword.status === 'optimal'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : keyword.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }`}
              >
                {keyword.status === 'optimal' ? '✓' : keyword.status === 'warning' ? '⚠' : '✗'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <span>{keyword.count}×</span>
              <span>•</span>
              <span className="font-medium">{keyword.density.toFixed(2)}%</span>
            </div>
            <div className="mt-2 h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  keyword.status === 'optimal'
                    ? 'bg-green-500'
                    : keyword.status === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, keyword.density * 20)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-[var(--color-text-muted)] italic">
        <span className="text-green-600 dark:text-green-400">✓ Optimal: 1-3%</span> •{' '}
        <span className="text-yellow-600 dark:text-yellow-400">⚠ Warning: 3-5%</span> •{' '}
        <span className="text-red-600 dark:text-red-400">✗ Critical: 5%+</span>
      </div>
    </div>
  )
}
