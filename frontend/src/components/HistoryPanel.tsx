import type { TranslationEntry } from '../types'

interface HistoryPanelProps {
    history: TranslationEntry[]
    onClear: () => void
}

export default function HistoryPanel({ history, onClear }: HistoryPanelProps) {
    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }).format(date)
    }

    return (
        <div className="history-panel">
            <div className="history-header">
                <h2>Translation History</h2>
                {history.length > 0 && (
                    <button
                        onClick={onClear}
                        className="clear-btn"
                        aria-label="Clear translation history"
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="history-list">
                {history.length === 0 ? (
                    <div className="history-empty">
                        <p>No translations yet. Start signing!</p>
                    </div>
                ) : (
                    history.map(entry => (
                        <div key={entry.id} className="history-item">
                            <div className="history-item-content">
                                <span className="history-word">{entry.word}</span>
                                {entry.spoken && (
                                    <span className="spoken-indicator" aria-label="Spoken">
                                        🔊
                                    </span>
                                )}
                            </div>
                            <span className="history-time">{formatTime(entry.timestamp)}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
