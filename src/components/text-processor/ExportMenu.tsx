import { useState, useEffect, useRef } from 'react'
import { Download, FileText, Code } from 'lucide-react'
import { useTextStore } from '@/store/textStore'
import { ReportExporter } from '@/utils/reportExporter'
import { Button } from '@/components/ui/Button'

interface ExportMenuProps {
  onToast: (message: string) => void
}

export function ExportMenu({ onToast }: ExportMenuProps) {
  const { text, stats } = useTextStore()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleExport = (exportFn: () => void, successMsg: string) => {
    if (!text) {
      onToast('Nothing to export')
      return
    }
    try {
      exportFn()
      onToast(successMsg)
      setIsOpen(false)
    } catch {
      onToast('Export failed')
    }
  }

  return (
    <div className="relative inline-block" ref={menuRef}>
      <Button onClick={() => setIsOpen(!isOpen)} className="gap-2">
        <Download size={16} />
        Export Report
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-56 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg shadow-lg z-20 overflow-hidden">
            <button
              onClick={() => handleExport(
                () => ReportExporter.downloadHTML(text, stats),
                'Report exported as HTML'
              )}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              <Code size={16} />
              <div className="text-left">
                <div className="font-medium">Export as HTML</div>
                <div className="text-xs text-[var(--color-text-muted)]">Full styled report</div>
              </div>
            </button>

            <button
              onClick={() => handleExport(
                () => ReportExporter.downloadMarkdown(text, stats),
                'Report exported as Markdown'
              )}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors border-t border-[var(--color-border)]"
            >
              <FileText size={16} />
              <div className="text-left">
                <div className="font-medium">Export as Markdown</div>
                <div className="text-xs text-[var(--color-text-muted)]">Plain text format</div>
              </div>
            </button>

            <button
              onClick={async () => {
                if (!text) {
                  onToast('Nothing to copy')
                  return
                }
                try {
                  await ReportExporter.copyMarkdownToClipboard(text, stats)
                  onToast('Report copied as Markdown')
                  setIsOpen(false)
                } catch {
                  onToast('Copy failed')
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors border-t border-[var(--color-border)]"
            >
              <FileText size={16} />
              <div className="text-left">
                <div className="font-medium">Copy as Markdown</div>
                <div className="text-xs text-[var(--color-text-muted)]">To clipboard</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
