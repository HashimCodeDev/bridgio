import express from "express"
import { createServer } from "http"
import cors from "cors"
import socket from "./socket.js"

const app = express()
app.use(cors())

const server = createServer(app)

socket(server)

const PORT = 3000
server.listen(PORT, () => {
    console.log(`Node backend running on port ${PORT}`)
})