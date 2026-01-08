import { useEffect, useRef, useState } from "react"
import socket from "../socket"

interface CameraStreamProps {
    onStreamReady?: (ready: boolean) => void
}

export default function CameraStream({ onStreamReady }: CameraStreamProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<string>("")

    useEffect(() => {
        let interval: NodeJS.Timeout

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user'
                    }
                })

                streamRef.current = stream

                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    await videoRef.current.play()
                }

                setIsStreaming(true)
                onStreamReady?.(true)

                // Start frame capture at 10 FPS
                interval = setInterval(() => {
                    const canvas = canvasRef.current
                    const video = videoRef.current

                    if (!canvas || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
                        return
                    }

                    const ctx = canvas.getContext("2d")
                    if (!ctx) return

                    canvas.width = 640
                    canvas.height = 480
                    ctx.drawImage(video, 0, 0, 640, 480)

                    const frame = canvas.toDataURL("image/jpeg", 0.8)
                    socket.emit("frame", frame)
                }, 100)

            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Camera access denied'
                setError(errorMsg)
                onStreamReady?.(false)
                console.error('Camera error:', err)
            }
        }

        startCamera()

        return () => {
            if (interval) clearInterval(interval)
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [onStreamReady])

    return (
        <div className="camera-stream">
            <h2>Live Camera Feed</h2>
            {error ? (
                <div className="camera-error">
                    <p>⚠️ {error}</p>
                    <p className="error-help">Please allow camera access to use sign language translation.</p>
                </div>
            ) : (
                <div className="video-wrapper">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="camera-video"
                    />
                    {isStreaming && (
                        <div className="recording-indicator">
                            <span className="recording-dot"></span>
                            <span>Recording</span>
                        </div>
                    )}
                </div>
            )}
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    )
}