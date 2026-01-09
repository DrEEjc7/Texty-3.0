import { useState } from 'react'
import { useTextStore } from '@/store/textStore'
import { TextFormatter, CaseConverter } from '@/utils/textFormatter'
import { copyToClipboard, exportAsText } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { TextStats } from './TextStats'
import { Keywords } from './Keywords'
import { KeywordDensity } from './KeywordDensity'
import { ReadabilityScores } from './ReadabilityScores'
import { WritingStyleAnalysis } from './WritingStyleAnalysis'
import { ExportMenu } from './ExportMenu'
import { HighlightedTextArea } from './HighlightedTextArea'
import { HighlightsLegend } from './HighlightsLegend'
import { SAMPLE_TEXT } from '@/constants/sampleText'

interface TextProcessorProps {
  onToast: (message: string) => void
}

export function TextProcessor({ onToast }: TextProcessorProps) {
  const { text, setText, clearText } = useTextStore()
  const [showHighlights, setShowHighlights] = useState(false)

  const handleStripFormatting = () => {
    if (!text) {
      onToast('No text to format')
      return
    }
    try {
      setText(TextFormatter.stripFormatting(text))
      onToast('Formatting stripped')
    } catch (error) {
      onToast('Failed to strip formatting')
      console.error('Strip formatting error:', error)
    }
  }

  const handleAutoFormat = () => {
    if (!text) {
      onToast('No text to format')
      return
    }
    try {
      setText(TextFormatter.autoFormat(text))
      onToast('Text auto-formatted')
    } catch (error) {
      onToast('Failed to auto-format text')
      console.error('Auto format error:', error)
    }
  }

  const handleCaseConvert = (caseType: 'upper' | 'lower' | 'title' | 'sentence') => {
    if (!text) {
      onToast('No text to convert')
      return
    }
    try {
      setText(CaseConverter.convert(text, caseType))
      onToast(`Converted to ${caseType} case`)
    } catch (error) {
      onToast('Failed to convert case')
      console.error('Case convert error:', error)
    }
  }

  const handleCopy = async () => {
    if (!text) {
      onToast('Nothing to copy')
      return
    }
    try {
      await copyToClipboard(text)
      onToast('Text copied to clipboard')
    } catch (error) {
      onToast('Failed to copy to clipboard')
      console.error('Copy error:', error)
    }
  }

  const handleClear = () => {
    clearText()
    onToast('Text cleared')
  }

  const handleExport = () => {
    if (!text) {
      onToast('Nothing to export')
      return
    }
    try {
      exportAsText(text)
      onToast('Text exported successfully')
    } catch (error) {
      onToast('Failed to export text')
      console.error('Export error:', error)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    const clipboardData = e.clipboardData
    const pastedHtml = clipboardData.getData('text/html')
    const pastedText = clipboardData.getData('text/plain')

    const cleanText = TextFormatter.stripFormatting(pastedHtml || pastedText)

    const target = e.currentTarget
    const start = target.selectionStart
    const end = target.selectionEnd
    const currentText = target.value

    const newText = currentText.substring(0, start) + cleanText + currentText.substring(end)
    setText(newText)

    setTimeout(() => {
      const newCursorPos = start + cleanText.length
      target.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleTrySample = () => {
    setText(SAMPLE_TEXT)
    onToast('Sample text loaded')
  }

  return (
    <section className="pb-8 mb-8 border-b border-[var(--color-border)]">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">TEXT PROCESSOR</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Clean, format, and transform your text instantly
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 pb-6 border-[var(--color-border)]" role="toolbar" aria-label="Text formatting tools">
        <Button onClick={handleStripFormatting} aria-label="Remove all formatting from text">Strip Formatting</Button>
        <Button onClick={handleAutoFormat} aria-label="Auto-format text with proper spacing and capitalization">Auto Format</Button>
        <Button
          variant={showHighlights ? "primary" : "outline"}
          onClick={() => setShowHighlights(!showHighlights)}
          aria-label={showHighlights ? "Hide writing suggestions" : "Show writing suggestions"}
          aria-pressed={showHighlights}
        >
          {showHighlights ? 'Hide' : 'Show'} Highlights
        </Button>
        <Button variant="case" onClick={() => handleCaseConvert('sentence')} aria-label="Convert to sentence case">
          Sentence case
        </Button>
        <Button variant="case" onClick={() => handleCaseConvert('lower')} aria-label="Convert to lowercase">
          lower case
        </Button>
        <Button variant="case" onClick={() => handleCaseConvert('upper')} aria-label="Convert to uppercase">
          UPPER CASE
        </Button>
        <Button variant="case" onClick={() => handleCaseConvert('title')} aria-label="Convert to title case">
          Title Case
        </Button>
      </div>

      <HighlightedTextArea
        value={text}
        onChange={setText}
        onPaste={handlePaste}
        placeholder="Paste your text here to get started..."
        showHighlights={showHighlights}
      />

      <div className="flex gap-2 mt-6 flex-wrap" role="group" aria-label="Text actions">
        <Button onClick={handleTrySample} variant="outline" aria-label="Load sample text to try features">Try Sample Text</Button>
        <Button onClick={handleCopy} aria-label="Copy text to clipboard">Copy Text</Button>
        <Button onClick={handleClear} aria-label="Clear all text">Clear Text</Button>
        <Button onClick={handleExport} aria-label="Export text as TXT file">Export as TXT</Button>
        <ExportMenu onToast={onToast} />
      </div>

      {text && <HighlightsLegend />}

      <TextStats />
      <KeywordDensity />
      <ReadabilityScores />
      <WritingStyleAnalysis />
      <Keywords />
    </section>
  )
}
