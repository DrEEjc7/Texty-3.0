import { ThemeToggle } from './components/layout/ThemeToggle'
import { Footer } from './components/layout/Footer'
import { TextProcessor } from './components/text-processor/TextProcessor'
import { LoremGenerator } from './components/lorem-generator/LoremGenerator'
import { Toast } from './components/ui/Toast'
import { useToast } from './hooks/useToast'
import { useTextAnalysis } from './hooks/useTextAnalysis'

function App() {
  const { message, isVisible, showToast } = useToast()

  // Run text analysis whenever text changes
  useTextAnalysis()

  return (
    <>
      <ThemeToggle />

      <main className="max-w-[900px] mx-auto px-6 py-8">
        <TextProcessor onToast={showToast} />
        <LoremGenerator onToast={showToast} />
      </main>

      <Footer />
      <Toast message={message} isVisible={isVisible} />
    </>
  )
}

export default App
