import type { TranslationEntry } from '../types'

interface HistoryPanelProps {
    history: TranslationEntry[]
    onClear: () => void
}

export default function HistoryPanel({ history, onClear }: HistoryPanelProps) {
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

            <div className="history-captions">
                {history.length === 0 ? (
                    <div className="history-empty">
                        <p>No translations yet. Start signing!</p>
                    </div>
                ) : (
                    history.map(entry => (
                        <div key={entry.id} className="caption-word">
                            {entry.word}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
