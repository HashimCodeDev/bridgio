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

            // Add to history
            const entryId = addTranslation(word)

            // Speak only if it's a new word
            if (shouldSpeak(word)) {
                speak(word, () => {
                    if (entryId) {
                        markAsSpoken(entryId)
                    }
                })
                updateLastSpoken(word)
            } else if (entryId) {
                // Mark as spoken if it matches the last word
                markAsSpoken(entryId)
            }
        }

        socket.on("prediction", handlePrediction)

        return () => {
            socket.off("prediction", handlePrediction)
        }
    }, [speak, addTranslation, markAsSpoken, shouldSpeak, updateLastSpoken])

    return (
        <div className="output-section">
            <div className="output-box">
                <h3>Current Translation</h3>
                <div className="output-text">
                    {currentText || "Waiting for sign language input..."}
                </div>
            </div>
            <HistoryPanel history={history} onClear={clearHistory} />
        </div>
    )
}
