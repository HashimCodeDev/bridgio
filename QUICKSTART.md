# Quick Reference Guide

Fast reference for common tasks and commands.

---

## 🚀 Getting Started (1-Minute Setup)

```bash
# Clone and navigate
git clone <repo-url>
cd bridgio

# Make startup script executable
chmod +x start.sh

# Run everything
./start.sh
```

Open browser: **http://localhost:5173**

---

## 📁 Project Structure

```
bridgio/
├── frontend/     # React UI (port 5173)
├── backend/      # Node.js bridge (port 3000)
├── ML/           # Python ML server (port 8000)
├── start.sh      # Linux/Mac startup script
├── start.ps1     # Windows startup script
└── README.md     # Main documentation
```

---

## 🛠️ Common Commands

### Frontend
```bash
cd frontend
pnpm install        # Install dependencies
pnpm dev            # Start dev server
pnpm build          # Build for production
pnpm preview        # Preview production build
```

### Backend
```bash
cd backend
pnpm install        # Install dependencies
pnpm dev            # Start with auto-reload
pnpm start          # Start production
```

### ML Server
```bash
cd ML
uv sync             # Install dependencies
uv run python app.py           # Start server
uv run python train.py         # Train model
uv run python collect_data.py  # Collect training data
uv run python test.py          # Test model
```

---

## 🔧 Configuration

### Change Ports

**Frontend** → Backend connection:
- Edit: `frontend/src/socket.ts`
- Change: `io("http://localhost:3000")`

**Backend** → ML connection:
- Edit: `backend/pythonClient.js`
- Change: `ws://localhost:8000/ws`

**Backend port:**
- Edit: `backend/server.js`
- Change: `PORT = 3000`

**ML port:**
- Edit: `ML/app.py`
- Change: `port=8000`

---

## 🎨 Customization

### Add New Sign

1. Collect data:
```bash
cd ML
uv run python collect_data.py
```

2. Update labels:
```json
// ML/labels.json
{
  "16": "NEW_SIGN_NAME"
}
```

3. Retrain:
```bash
uv run python train.py
```

### Change Theme Colors

Edit `frontend/src/index.css`:
```css
:root {
  --accent-primary: #667eea;  /* Change this */
  --accent-secondary: #764ba2; /* And this */
}
```

### Adjust Frame Rate

Edit `frontend/src/components/CameraStream.tsx`:
```typescript
setInterval(() => {
  // ...
}, 100)  // 100ms = 10 FPS, change to 200 for 5 FPS
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Camera not working | Check browser permissions, use HTTPS |
| No predictions | Ensure ML server running, check logs |
| Connection failed | Verify all servers running on correct ports |
| Import errors (Python) | Run `uv sync` or `pip install -r requirements.txt` |
| Port in use | Change port or kill process: `lsof -ti:3000 \| xargs kill` |

### View Logs

```bash
# Frontend: Browser DevTools Console

# Backend:
cd backend
pnpm dev  # See logs in terminal

# ML Server:
cd ML
uv run python app.py  # See logs in terminal
```

---

## 📊 Health Checks

```bash
# Backend
curl http://localhost:3000/health

# ML Server
curl http://localhost:8000/health

# Frontend
# Open http://localhost:5173 in browser
```

---

## 🔍 Debugging

### Frontend Issues

Open browser DevTools (F12):
- **Console:** Error messages
- **Network → WS:** WebSocket connection
- **Application → Storage:** Theme preference

### Backend Issues

```bash
# Check if running
lsof -i :3000

# Check connection to ML
cd backend
node -e "const WebSocket = require('ws'); const ws = new WebSocket('ws://localhost:8000/ws'); ws.on('open', () => console.log('OK'));"
```

### ML Server Issues

```bash
# Verify dependencies
cd ML
uv run python -c "import torch, mediapipe, cv2; print('All imports OK')"

# Test model
uv run python -c "from classifier import predict; print('Model loaded')"

# Check MediaPipe file
ls -lh hand_landmarker.task
```

---

## 📦 Dependencies

### System Requirements
- **Node.js:** 18+
- **Python:** 3.13+
- **pnpm:** Latest
- **uv:** Latest (or pip)
- **Webcam:** Required

### Frontend Packages
- react, react-dom
- socket.io-client
- TypeScript
- Vite

### Backend Packages
- express
- socket.io
- ws
- cors

### ML Packages
- fastapi
- uvicorn
- torch
- mediapipe
- opencv-python
- numpy

---

## 🎯 Performance Tuning

### Reduce Latency
```typescript
// frontend/src/components/CameraStream.tsx
// Reduce frame size
canvas.width = 320  // Instead of 640
canvas.height = 240 // Instead of 480
```

### Increase Accuracy
```python
# ML/hand_tracking.py
HandLandmarkerOptions(
    min_hand_detection_confidence=0.8,  # Increase from 0.6
    min_tracking_confidence=0.8         # Increase from 0.6
)
```

### Save Bandwidth
```typescript
// frontend/src/components/CameraStream.tsx
const frame = canvas.toDataURL("image/jpeg", 0.6) // Reduce quality
```

---

## 🔐 Security Quick Tips

- Use HTTPS in production
- Set CORS properly
- Don't commit `.env` files
- Keep dependencies updated
- Use environment variables for secrets

---

## 📚 Documentation Links

- [Main README](README.md) - Overview & setup
- [Architecture](ARCHITECTURE.md) - System design
- [Contributing](CONTRIBUTING.md) - How to contribute
- [Deployment](DEPLOYMENT.md) - Production deployment
- [Frontend README](frontend/README.md) - Frontend details
- [Backend README](backend/README.md) - Backend details
- [ML README](ML/README.md) - ML server details

---

## 💡 Tips & Tricks

### Kill All Processes
```bash
# Linux/Mac
pkill -f "node.*backend"
pkill -f "python.*app.py"
pkill -f "vite"

# Or use the startup script's Ctrl+C handler
```

### Reset Everything
```bash
# Clear node_modules
rm -rf frontend/node_modules backend/node_modules
rm -rf frontend/dist

# Reinstall
cd frontend && pnpm install
cd ../backend && pnpm install

# Clear Python cache
cd ../ML
find . -type d -name __pycache__ -exec rm -rf {} +
uv sync
```

### Check All Services
```bash
# One-liner
curl -s http://localhost:3000/health && curl -s http://localhost:8000/health && curl -s http://localhost:5173 && echo "All OK"
```

---

## 🎓 Learn More

- **React:** https://react.dev/
- **Socket.IO:** https://socket.io/docs/
- **FastAPI:** https://fastapi.tiangolo.com/
- **MediaPipe:** https://developers.google.com/mediapipe
- **PyTorch:** https://pytorch.org/tutorials/

---

## ❓ FAQ

**Q: Can I use this commercially?**  
A: Yes, but keep it free for individuals with disabilities.

**Q: How accurate is it?**  
A: Depends on training data quality. Typically 85-95% with good lighting.

**Q: Can I add more signs?**  
A: Yes! Use `collect_data.py` to gather samples and retrain.

**Q: Does it work offline?**  
A: Currently no, but you can run all services locally.

**Q: Can I use a different ML model?**  
A: Yes, replace the model in `classifier.py` and ensure input/output format matches.

**Q: How do I update?**  
A: `git pull` then reinstall dependencies if needed.

---

**Quick Help:** Run `./start.sh` and open http://localhost:5173  
**Issues?** Check logs in terminal or browser console  
**Still stuck?** Create an issue on GitHub with error logs
