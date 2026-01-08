import express from "express"
import { createServer } from "http"
import cors from "cors"
import socket from "./socket.js"

const app = express()
app.use(cors())

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "sign-language-backend",
        timestamp: new Date().toISOString()
    })
})

const server = createServer(app)

socket(server)

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║   🚀 Sign Language Backend Server        ║
║   Port: ${PORT}                             ║
║   Status: Running                         ║
║   WebSocket: Ready                        ║
╚═══════════════════════════════════════════╝
    `)
})

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server gracefully...')
    server.close(() => {
        console.log('Server closed')
        process.exit(0)
    })
})