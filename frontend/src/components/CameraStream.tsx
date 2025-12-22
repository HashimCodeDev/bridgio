import { useEffect, useRef } from "react"
import socket from "../socket"

export default function CameraStream() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
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

        return () => clearInterval(interval)
    }, [])

    return (
        <>
            <video ref={videoRef} autoPlay muted />
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </>
    )
}
