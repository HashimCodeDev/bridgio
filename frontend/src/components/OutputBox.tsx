import { useEffect, useState } from "react"
import socket from "../socket"

export default function OutputBox() {
    const [text, setText] = useState("")

    useEffect(() => {
        socket.on("prediction", data => {
            setText(data.text)
            speechSynthesis.speak(
                new SpeechSynthesisUtterance(data.text)
            )
        })
    }, [])

    return (
        <div className="output-box">
            <h3>Translation Output</h3>
            <div className="output-text">
                {text || "Waiting for sign language input..."}
            </div>
        </div>
    )
}
