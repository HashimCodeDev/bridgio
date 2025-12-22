import WebSocket from "ws"

const pythonSocket = new WebSocket("ws://localhost:8000/ws")

pythonSocket.on("open", () => {
    console.log("Connected to Python ML service")
})

function sendFrameToPython(frame, callback) {
    pythonSocket.send(JSON.stringify({ frame }))

    pythonSocket.once("message", message => {
        const data = JSON.parse(message)
        callback(data.text)
    })
}

export default { sendFrameToPython }
