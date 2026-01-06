import { useEffect, useRef, useState } from "react"
import socket from "../socket"

export default function CameraStream() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const lastPredictionRef = useRef<string>("")
    const [prediction, setPrediction] = useState<string>("")

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
        })

        const interval = setInterval(() => {
            const canvas = canvasRef.current
            const video = videoRef.current
            if (!canvas || !video) return

            const ctx = canvas.getContext("2d")
            if (!ctx) return

            canvas.width = 640
            canvas.height = 480
            ctx.drawImage(video, 0, 0, 640, 480)

            const frame = canvas.toDataURL("image/jpeg")
            socket.emit("frame", frame)
        }, 100) // 10 FPS

        const handlePrediction = (data: { text: string }) => {
            if (data.text !== lastPredictionRef.current) {
                setPrediction(data.text)
                lastPredictionRef.current = data.text
            }
        }

        socket.on("prediction", handlePrediction)

        return () => {
            clearInterval(interval)
            socket.off("prediction", handlePrediction)
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    return (
        <div className="camera-stream">
            <h2>Camera Feed</h2>
            <div className="video-wrapper">
                <video ref={videoRef} autoPlay muted className="camera-video" />
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <h3>{prediction}</h3>
        </div>
    )
}