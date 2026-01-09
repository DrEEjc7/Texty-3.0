import { useTextStore } from '@/store/textStore'

export function Keywords() {
  const { stats } = useTextStore()

  return (
    <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
      <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
        Top Keywords
      </h3>
      <div className="flex flex-wrap gap-2 min-h-[32px] items-start">
        {stats.keywords.length === 0 ? (
          <span className="text-[var(--color-text-muted)] italic text-sm">
            Start typing to see keywords...
          </span>
        ) : (
          stats.keywords.map((keyword) => (
            <span
              key={keyword}
              className="bg-[var(--color-text-primary)] text-[var(--color-text-inverse)] px-2 py-1 rounded-lg text-xs font-semibold"
            >
              {keyword.toUpperCase()}
            </span>
          ))
        )}
      </div>
    </div>
  )
}
