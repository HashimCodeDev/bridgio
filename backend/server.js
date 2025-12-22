const express = require("express")
const http = require("http")
const cors = require("cors")

const app = express()
app.use(cors())

const server = http.createServer(app)

require("./socket")(server)

const PORT = 3000
server.listen(PORT, () => {
    console.log(`Node backend running on port ${PORT}`)
})
