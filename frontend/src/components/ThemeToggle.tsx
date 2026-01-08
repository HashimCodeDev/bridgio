import type { Theme } from '../hooks/useTheme'

interface ThemeToggleProps {
    theme: Theme
    onToggle: () => void
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
    return (
        <button
            className="theme-toggle"
            onClick={onToggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    )
}
