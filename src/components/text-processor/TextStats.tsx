import { useTextStore } from '@/store/textStore'
import { formatNumber } from '@/lib/utils'

export function TextStats() {
  const { stats } = useTextStore()

  const statsItems = [
    { label: 'Words', value: formatNumber(stats.words) },
    { label: 'Unique Words', value: formatNumber(stats.uniqueWords) },
    { label: 'Characters', value: formatNumber(stats.characters) },
    { label: 'Sentences', value: formatNumber(stats.sentences) },
    { label: 'Paragraphs', value: formatNumber(stats.paragraphs) },
    { label: 'Avg Word Length', value: stats.avgWordLength },
    { label: 'Read Time', value: `${stats.readingTime}m` },
    { label: 'Grade Level', value: stats.gradeLevel },
    { label: 'Readability Score', value: stats.fleschScore },
  ]

  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {statsItems.map((item) => (
        <div
          key={item.label}
          className="border border-[var(--color-border)] rounded-lg px-4 py-1 text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-primary)] whitespace-nowrap"
        >
          <span className="font-bold text-[var(--color-text-primary)] mr-1">{item.value}</span>
          {item.label}
        </div>
      ))}
    </div>
  )
}
