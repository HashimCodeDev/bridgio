import { Server } from "socket.io"
import pythonClient from "./pythonClient"
const { sendFrameToPython } = pythonClient

export default (server) => {
    const io = new Server(server, {
        cors: { origin: "*" }
    })

    io.on("connection", socket => {
        console.log("Frontend connected")

        socket.on("frame", frame => {
            sendFrameToPython(frame, prediction => {
                socket.emit("prediction", { text: prediction })
            })
        })

        socket.on("disconnect", () => {
            console.log("Frontend disconnected")
        })
    })
}
