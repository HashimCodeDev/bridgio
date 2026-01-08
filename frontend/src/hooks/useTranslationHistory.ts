import { useState, useCallback } from 'react'
import type { TranslationEntry } from '../types'

export function useTranslationHistory() {
    const [history, setHistory] = useState<TranslationEntry[]>([])
    const [lastSpokenWord, setLastSpokenWord] = useState<string>('')

    const addTranslation = useCallback((word: string) => {
        if (!word || word.trim() === '') return

        const normalizedWord = word.trim()

        // Prevent adding consecutive duplicates to history
        setHistory(prev => {
            const lastEntry = prev[prev.length - 1]
            if (lastEntry && lastEntry.word === normalizedWord) {
                // Don't add duplicate, return existing history
                return prev
            }

            const newEntry: TranslationEntry = {
                id: `${Date.now()}-${Math.random()}`,
                timestamp: new Date(),
                word: normalizedWord,
                spoken: false
            }

            return [...prev, newEntry]
        })

        // Return the ID even if not added (for consistency)
        return `${Date.now()}-${Math.random()}`
    }, [])

    const markAsSpoken = useCallback((id: string) => {
        setHistory(prev =>
            prev.map(entry =>
                entry.id === id ? { ...entry, spoken: true } : entry
            )
        )
    }, [])

    const clearHistory = useCallback(() => {
        setHistory([])
        setLastSpokenWord('')
    }, [])

    const shouldSpeak = useCallback((word: string) => {
        return word !== lastSpokenWord && word.trim() !== ''
    }, [lastSpokenWord])

    const updateLastSpoken = useCallback((word: string) => {
        setLastSpokenWord(word)
    }, [])

    return {
        history,
        addTranslation,
        markAsSpoken,
        clearHistory,
        shouldSpeak,
        updateLastSpoken
    }
}
