import { useEffect, useState } from "react"
import socket from "../socket"
import { useTextToSpeech } from "../hooks/useTextToSpeech"
import { useTranslationHistory } from "../hooks/useTranslationHistory"
import HistoryPanel from "./HistoryPanel"

export default function OutputBox() {
    const [currentText, setCurrentText] = useState("")
    const { speak } = useTextToSpeech()
    const {
        history,
        addTranslation,
        markAsSpoken,
        clearHistory,
        shouldSpeak,
        updateLastSpoken
    } = useTranslationHistory()

    useEffect(() => {
        const handlePrediction = (data: { text: string }) => {
            const word = data.text?.trim()

            if (!word) {
                setCurrentText("")
                return
            }

            setCurrentText(word)

            // Only speak and add to history if it's a new word
            if (shouldSpeak(word)) {
                // Add to history (will only add if not a consecutive duplicate)
                addTranslation(word)

                // Speak the word with text-to-speech
                speak(word)

                // Update the last spoken word
                updateLastSpoken(word)
            }
        }

        socket.on("prediction", handlePrediction)

        return () => {
            socket.off("prediction", handlePrediction)
        }
    }, [speak, addTranslation, shouldSpeak, updateLastSpoken])

    return (
        <div className="output-section">
            <div className="output-box">
                <h3>Current Translation</h3>
                <div className="output-text">
                    {currentText || ""}
                </div>
            </div>
            <HistoryPanel history={history} onClear={clearHistory} />
        </div>
    )
}
