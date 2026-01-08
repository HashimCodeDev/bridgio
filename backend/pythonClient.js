import WebSocket from "ws"

let pythonSocket = null
let reconnectInterval = null
let isConnecting = false

function connectToPython() {
    if (isConnecting) return

    isConnecting = true
    pythonSocket = new WebSocket("ws://localhost:8000/ws")

    pythonSocket.on("open", () => {
        console.log("✅ Connected to Python ML service")
        isConnecting = false
        if (reconnectInterval) {
            clearInterval(reconnectInterval)
            reconnectInterval = null
        }
    })

    pythonSocket.on("close", () => {
        console.log("⚠️  Disconnected from Python ML service")
        isConnecting = false
        attemptReconnect()
    })

    pythonSocket.on("error", (error) => {
        console.error("❌ Python connection error:", error.message)
        isConnecting = false
    })
}

function attemptReconnect() {
    if (reconnectInterval) return

    console.log("🔄 Will attempt to reconnect to Python ML service...")
    reconnectInterval = setInterval(() => {
        if (pythonSocket?.readyState !== WebSocket.OPEN) {
            console.log("🔄 Reconnecting to Python ML service...")
            connectToPython()
        }
    }, 5000)
}

function sendFrameToPython(frame, callback, errorCallback) {
    if (!pythonSocket || pythonSocket.readyState !== WebSocket.OPEN) {
        console.warn("⚠️  Python ML service not connected, skipping frame")
        if (errorCallback) {
            errorCallback(new Error("ML service not connected"))
        }
        return
    }

    try {
        pythonSocket.send(JSON.stringify({ frame }))

        const messageHandler = (message) => {
            try {
                const data = JSON.parse(message)
                callback(data.text)
            } catch (err) {
                console.error("Error parsing ML response:", err)
                if (errorCallback) errorCallback(err)
            }
            pythonSocket.off("message", messageHandler)
        }

        pythonSocket.once("message", messageHandler)

        // Timeout after 5 seconds
        setTimeout(() => {
            pythonSocket.off("message", messageHandler)
        }, 5000)

    } catch (error) {
        console.error("Error sending frame:", error)
        if (errorCallback) errorCallback(error)
    }
}

// Initialize connection
connectToPython()

export default { sendFrameToPython }
