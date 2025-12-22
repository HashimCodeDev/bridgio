const { Server } = require("socket.io")
const { sendFrameToPython } = require("./pythonClient")

module.exports = (server) => {
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
