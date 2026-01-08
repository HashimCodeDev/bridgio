# Backend - Sign Language Translator

Node.js WebSocket bridge connecting frontend to ML server.

## Purpose

Acts as a **communication layer** between:
- Frontend clients (browser)
- ML server (Python)

**Does NOT:**
- Process images
- Run ML models
- Extract features

## Architecture

```
Frontend (Browser)
    ↕ Socket.IO
Backend (Node.js)
    ↕ WebSocket
ML Server (Python)
```

## Tech Stack

- Node.js 18+
- Express - HTTP server
- Socket.IO - Frontend WebSocket
- ws - ML server WebSocket client

## Development

```bash
# Install dependencies
pnpm install

# Start dev server with auto-reload
pnpm dev

# Start production server
pnpm start
```

Server runs on **port 3000** by default.

## Features

### Multi-client Support
- Handles multiple concurrent browser connections
- Per-client frame routing
- Connection tracking

### Auto-reconnect
- Automatically reconnects to ML server
- 5-second retry interval
- Graceful error handling

### Logging
- Connection events
- Frame processing
- Error messages
- Client count

### Health Check
```bash
curl http://localhost:3000/health
```

## File Structure

```
backend/
├── server.js          # Express app + HTTP server
├── socket.js          # Frontend WebSocket handler
└── pythonClient.js    # ML server WebSocket client
```

## Configuration

### Port
```bash
PORT=3000 node server.js
```

### ML Server URL
Edit [pythonClient.js](pythonClient.js):
```javascript
new WebSocket("ws://localhost:8000/ws")
```

## WebSocket Events

### From Frontend
- `frame` - Base64 encoded JPEG image

### To Frontend
- `prediction` - `{ text: "SIGN_NAME" }`

### To/From ML Server
- Send: `{ frame: "data:image/jpeg;base64,..." }`
- Receive: `{ text: "SIGN_NAME" }`

## Error Handling

- Connection failures → auto-reconnect
- Invalid frames → skip + log
- ML server down → queue frames or skip
- Client disconnect → cleanup

## Production

### Using PM2
```bash
pnpm install -g pm2
pm2 start server.js --name sign-backend
pm2 logs sign-backend
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Environment Variables
```bash
PORT=3000
NODE_ENV=production
```

## Monitoring

Check logs for:
- ✅ Connected clients
- ❌ Disconnections
- ⚠️ ML server status
- 🔄 Reconnection attempts

## Troubleshooting

**Frontend can't connect:**
- Check CORS settings in `socket.js`
- Verify port 3000 is not in use
- Check firewall rules

**ML server connection fails:**
- Ensure Python server is running on port 8000
- Check `pythonClient.js` URL
- Review ML server logs
