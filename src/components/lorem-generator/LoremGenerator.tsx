import { useEffect } from 'react'
import { useTextStore } from '@/store/textStore'
import { LoremGenerator as Generator } from '@/utils/loremGenerator'
import { copyToClipboard } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface LoremGeneratorProps {
  onToast: (message: string) => void
}

export function LoremGenerator({ onToast }: LoremGeneratorProps) {
  const { loremText, setLoremText, loremConfig, setLoremConfig, clearLoremText } = useTextStore()

  const handleGenerate = () => {
    const generated = Generator.generate(loremConfig)
    setLoremText(generated)
    onToast('Lorem text generated')
  }

  const handleCopy = async () => {
    if (!loremText) {
      onToast('Nothing to copy')
      return
    }
    try {
      await copyToClipboard(loremText)
      onToast('Lorem copied to clipboard')
    } catch {
      onToast('Failed to copy')
    }
  }

  const handleClear = () => {
    clearLoremText()
    onToast('Lorem cleared')
  }

  // Generate initial lorem on mount
  useEffect(() => {
    if (!loremText) {
      handleGenerate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-regenerate when config changes
  useEffect(() => {
    if (loremText) {
      handleGenerate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loremConfig.type, loremConfig.count, loremConfig.style])

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">
          LOREM IPSUM GENERATOR
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Generate placeholder text in multiple ways
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="lorem-type"
            className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider"
          >
            Type
          </label>
          <select
            id="lorem-type"
            value={loremConfig.type}
            onChange={(e) =>
              setLoremConfig({ type: e.target.value as 'paragraphs' | 'sentences' | 'words' })
            }
            className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] transition-all outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHBhdGggc3Ryb2tlPSIjNmI3MjgwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41IiBkPSJtNiA4IDQgNCA0LTQiLz48L3N2Zz4=')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat pr-10 focus:border-[var(--color-border-focus)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] dark:focus:shadow-[0_0_0_3px_rgba(248,250,252,0.05)]"
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="lorem-count"
            className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider"
          >
            Count
          </label>
          <input
            id="lorem-count"
            type="number"
            value={loremConfig.count}
            onChange={(e) => setLoremConfig({ count: parseInt(e.target.value) || 1 })}
            min="1"
            max="50"
            className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] transition-all outline-none focus:border-[var(--color-border-focus)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] dark:focus:shadow-[0_0_0_3px_rgba(248,250,252,0.05)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="lorem-style"
            className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider"
          >
            Style
          </label>
          <select
            id="lorem-style"
            value={loremConfig.style}
            onChange={(e) =>
              setLoremConfig({
                style: e.target.value as 'latin' | 'english' | 'tech' | 'business',
              })
            }
            className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] transition-all outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHBhdGggc3Ryb2tlPSIjNmI3MjgwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41IiBkPSJtNiA4IDQgNCA0LTQiLz48L3N2Zz4=')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat pr-10 focus:border-[var(--color-border-focus)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] dark:focus:shadow-[0_0_0_3px_rgba(248,250,252,0.05)]"
          >
            <option value="latin">Latin</option>
            <option value="english">English</option>
            <option value="tech">Tech</option>
            <option value="business">Business</option>
          </select>
        </div>
      </div>

      <textarea
        value={loremText}
        readOnly
        aria-label="Generated Lorem Ipsum Text"
        className="w-full min-h-[200px] p-6 border border-[var(--color-border)] rounded-lg font-mono text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] resize-y outline-none opacity-90 placeholder:text-[var(--color-text-muted)]"
        placeholder="Generated text will appear here..."
        rows={8}
      />

      <div className="flex gap-2 mt-6 flex-wrap">
        <Button variant="primary" onClick={handleGenerate}>
          Generate
        </Button>
        <Button onClick={handleCopy}>Copy</Button>
        <Button onClick={handleClear}>Clear</Button>
      </div>
    </section>
  )
}
