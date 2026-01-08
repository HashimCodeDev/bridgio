import { useState, useCallback } from 'react'
import type { TranslationEntry } from '../types'

export function useTranslationHistory() {
    const [history, setHistory] = useState<TranslationEntry[]>([])
    const [lastSpokenWord, setLastSpokenWord] = useState<string>('')

    const addTranslation = useCallback((word: string) => {
        if (!word || word.trim() === '') return

        const newEntry: TranslationEntry = {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            word: word.trim(),
            spoken: false
        }

        setHistory(prev => [...prev, newEntry])
        return newEntry.id
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
