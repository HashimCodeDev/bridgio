import { Server } from "socket.io"
import pythonClient from "./pythonClient.js"
const { sendFrameToPython } = pythonClient

export default (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        pingTimeout: 60000,
        pingInterval: 25000
    })

    let connectedClients = 0

    io.on("connection", socket => {
        connectedClients++
        console.log(`✅ Frontend connected (ID: ${socket.id}, Total: ${connectedClients})`)

        socket.on("frame", frame => {
            sendFrameToPython(
                frame,
                (prediction) => {
                    socket.emit("prediction", { text: prediction })
                },
                (error) => {
                    console.error(`Error processing frame for ${socket.id}:`, error.message)
                    socket.emit("prediction", { text: "", error: error.message })
                }
            )
        })

        socket.on("disconnect", (reason) => {
            connectedClients--
            console.log(`❌ Frontend disconnected (ID: ${socket.id}, Reason: ${reason}, Remaining: ${connectedClients})`)
        })

        socket.on("error", (error) => {
            console.error(`Socket error (ID: ${socket.id}):`, error)
        })
    })

    return io
}
