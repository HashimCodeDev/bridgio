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
        <div style={{ fontSize: "2rem", marginTop: "20px" }}>
            {text}
        </div>
    )
}
