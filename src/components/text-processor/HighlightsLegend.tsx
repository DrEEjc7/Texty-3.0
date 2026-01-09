export function HighlightsLegend() {
  return (
    <div className="mt-4 p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
      <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
        Inline Highlights Guide
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded" style={{ background: 'rgba(234, 179, 8, 0.3)', borderBottom: '2px solid rgba(234, 179, 8, 0.8)' }}></span>
          <span className="text-[var(--color-text-secondary)]">
            <strong className="text-[var(--color-text-primary)]">Yellow:</strong> Passive voice
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded" style={{ background: 'rgba(249, 115, 22, 0.3)', borderBottom: '2px solid rgba(249, 115, 22, 0.8)' }}></span>
          <span className="text-[var(--color-text-secondary)]">
            <strong className="text-[var(--color-text-primary)]">Orange:</strong> Adverbs
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded" style={{ background: 'rgba(239, 68, 68, 0.3)', borderBottom: '2px solid rgba(239, 68, 68, 0.8)' }}></span>
          <span className="text-[var(--color-text-secondary)]">
            <strong className="text-[var(--color-text-primary)]">Red:</strong> Overused keywords
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded" style={{ background: 'rgba(59, 130, 246, 0.2)', borderLeft: '3px solid rgba(59, 130, 246, 0.8)' }}></span>
          <span className="text-[var(--color-text-secondary)]">
            <strong className="text-[var(--color-text-primary)]">Blue:</strong> Complex sentences
          </span>
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--color-text-secondary)] italic">
        Hover over any highlight to see suggestions for improvement
      </p>
    </div>
  )
}
