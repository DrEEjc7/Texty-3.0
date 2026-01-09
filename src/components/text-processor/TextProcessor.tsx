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
    setText(TextFormatter.stripFormatting(text))
    onToast('Formatting stripped')
  }

  const handleAutoFormat = () => {
    setText(TextFormatter.autoFormat(text))
    onToast('Text auto-formatted')
  }

  const handleCaseConvert = (caseType: 'upper' | 'lower' | 'title' | 'sentence') => {
    setText(CaseConverter.convert(text, caseType))
    onToast(`Converted to ${caseType} case`)
  }

  const handleCopy = async () => {
    if (!text) {
      onToast('Nothing to copy')
      return
    }
    try {
      await copyToClipboard(text)
      onToast('Text copied to clipboard')
    } catch {
      onToast('Failed to copy')
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
    } catch {
      onToast('Export failed. Please try again.')
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

      <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-[var(--color-border)]">
        <Button onClick={handleStripFormatting}>Strip Formatting</Button>
        <Button onClick={handleAutoFormat}>Auto Format</Button>
        <Button
          variant={showHighlights ? "primary" : "outline"}
          onClick={() => setShowHighlights(!showHighlights)}
        >
          {showHighlights ? 'Hide' : 'Show'} Highlights
        </Button>
        <Button variant="case" onClick={() => handleCaseConvert('sentence')}>
          Sentence case
        </Button>
        <Button variant="case" onClick={() => handleCaseConvert('lower')}>
          lower case
        </Button>
        <Button variant="case" onClick={() => handleCaseConvert('upper')}>
          UPPER CASE
        </Button>
        <Button variant="case" onClick={() => handleCaseConvert('title')}>
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

      <div className="flex gap-2 mt-6 flex-wrap">
        <Button onClick={handleTrySample} variant="outline">Try Sample Text</Button>
        <Button onClick={handleCopy}>Copy Text</Button>
        <Button onClick={handleClear}>Clear Text</Button>
        <Button onClick={handleExport}>Export as TXT</Button>
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
