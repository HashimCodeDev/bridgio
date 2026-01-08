import { useCallback, useRef } from 'react'

export function useTextToSpeech() {
    const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis)
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

    const speak = useCallback((text: string, onEnd?: () => void) => {
        // Cancel any ongoing speech
        synthRef.current.cancel()

        if (!text || text.trim() === '') return

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 1

        if (onEnd) {
            utterance.onend = onEnd
        }

        utteranceRef.current = utterance
        synthRef.current.speak(utterance)
    }, [])

    const stop = useCallback(() => {
        synthRef.current.cancel()
    }, [])

    return { speak, stop }
}
