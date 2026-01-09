export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="text-center py-8 border-t border-[var(--color-border)]">
      <div className="max-w-[900px] mx-auto px-6">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Copyright © {currentYear} • Designed with ❤️ by{' '}
          <a
            href="https://dee7studio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-text-primary)] font-semibold hover:text-[var(--color-text-secondary)] transition-colors"
          >
            Dee7 Studio
          </a>
        </p>
      </div>
    </footer>
  )
}
