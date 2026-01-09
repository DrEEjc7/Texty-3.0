import { useEffect, useRef, useMemo, useCallback } from 'react'
import { useTextStore } from '@/store/textStore'
import { TextHighlighter } from '@/utils/textHighlighter'

interface HighlightedTextAreaProps {
  value: string
  onChange: (value: string) => void
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  showHighlights: boolean
}

export function HighlightedTextArea({ value, onChange, onPaste, placeholder, showHighlights }: HighlightedTextAreaProps) {
  const { stats } = useTextStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  // Memoize highlighted HTML to avoid recalculating on every render
  const highlightedHTML = useMemo(() => {
    if (!value || !showHighlights) return ''
    const highlights = TextHighlighter.detectHighlights(value, stats.keywordDensity)
    return TextHighlighter.generateHighlightedHTML(value, highlights)
  }, [value, stats.keywordDensity, showHighlights])

  // Sync scroll between textarea and highlight overlay
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [])

  // Update highlight overlay when HTML changes
  useEffect(() => {
    if (highlightRef.current && showHighlights) {
      highlightRef.current.innerHTML = highlightedHTML
    }
  }, [highlightedHTML, showHighlights])

  return (
    <div className="relative">
      {/* Highlight overlay */}
      {showHighlights && (
        <div
          ref={highlightRef}
          className="absolute inset-0 w-full min-h-[320px] p-6 border border-transparent rounded-lg font-mono text-sm text-transparent pointer-events-none overflow-auto whitespace-pre-wrap break-words"
          style={{
            lineHeight: '1.5',
            wordBreak: 'break-word',
          }}
        />
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={onPaste}
        onScroll={handleScroll}
        aria-label="Text Processor Input"
        className="relative w-full min-h-[320px] p-6 border border-[var(--color-border)] rounded-lg font-mono text-sm bg-transparent text-[var(--color-text-primary)] resize-y outline-none transition-colors focus:border-[var(--color-border-focus)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] dark:focus:shadow-[0_0_0_3px_rgba(248,250,252,0.05)] placeholder:text-[var(--color-text-muted)]"
        placeholder={placeholder}
        style={{
          background: showHighlights ? 'transparent' : 'var(--color-bg-primary)',
        }}
      />

      {/* Styles for highlights */}
      <style>{`
        mark[class^="highlight-"] {
          border-radius: 2px;
          padding: 0 2px;
          position: relative;
          cursor: help;
          font-weight: normal;
          background-color: transparent;
        }

        .highlight-passive {
          color: rgba(234, 179, 8, 1);
          border-bottom: 2px solid rgba(234, 179, 8, 0.7);
        }

        .highlight-adverb {
          color: rgba(249, 115, 22, 1);
          border-bottom: 2px solid rgba(249, 115, 22, 0.7);
        }

        .highlight-keyword {
          color: rgba(239, 68, 68, 1);
          border-bottom: 2px solid rgba(239, 68, 68, 0.7);
        }

        .highlight-complex {
          color: rgba(59, 130, 246, 1);
          border-left: 3px solid rgba(59, 130, 246, 0.7);
          padding-left: 4px;
        }

        mark[data-tooltip]:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-4px);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          white-space: normal;
          max-width: 250px;
          width: max-content;
          z-index: 1000;
          pointer-events: none;
          line-height: 1.4;
        }

        mark[data-tooltip]:hover::before {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: rgba(0, 0, 0, 0.9);
          z-index: 1000;
        }

        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
          .highlight-passive {
            color: rgba(250, 204, 21, 1);
            border-bottom-color: rgba(250, 204, 21, 0.6);
          }
          .highlight-adverb {
            color: rgba(251, 146, 60, 1);
            border-bottom-color: rgba(251, 146, 60, 0.6);
          }
          .highlight-keyword {
            color: rgba(248, 113, 113, 1);
            border-bottom-color: rgba(248, 113, 113, 0.6);
          }
          .highlight-complex {
            color: rgba(96, 165, 250, 1);
            border-left-color: rgba(96, 165, 250, 0.6);
          }
        }
      `}</style>
    </div>
  )
}
