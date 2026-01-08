# 🤟 Sign Language Translator

**Real-time sign language to text and speech translation system**

An ethical, accessibility-first web application that translates sign language gestures into text and speech in real-time. Built with a modern tech stack and designed for production use.

---

## 🎯 Features

✅ **Real-time Translation** - Instant sign language recognition using webcam  
✅ **Text-to-Speech** - Automatic speech synthesis with duplicate prevention  
✅ **Translation History** - Full conversation log with timestamps  
✅ **Modern UI** - Dark/light themes, responsive design, accessibility-first  
✅ **Connection Status** - Live indicators for system health  
✅ **Multi-client Support** - Handle multiple concurrent users  
✅ **Ethical Design** - Free for individuals with disabilities  

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Socket.IO
│   (Port 5173)   │  - Webcam capture
└────────┬────────┘  - UI/UX
         │           - Text-to-Speech
         │ WebSocket
         ▼
┌─────────────────┐
│   Backend       │  Node.js + Express + Socket.IO
│   (Port 3000)   │  - WebSocket bridge
└────────┬────────┘  - Client management
         │           - Error handling
         │ WebSocket
         ▼
┌─────────────────┐
│   ML Server     │  Python + FastAPI + PyTorch
│   (Port 8000)   │  - MediaPipe hand tracking
└─────────────────┘  - Sign classification
                      - Inference
```

**Separation of Concerns:**
- Frontend: User interaction, display, audio
- Backend: Communication routing, orchestration
- ML Server: Computer vision, deep learning

---

## 📦 Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Socket.IO Client** - Real-time communication
- **Vite** - Build tool
- **Web Speech API** - Text-to-speech

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.IO** - WebSocket server
- **ws** - WebSocket client (to ML)

### ML Server
- **Python 3.13+**
- **FastAPI** - Web framework
- **MediaPipe** - Hand landmark detection
- **PyTorch** - Deep learning inference
- **OpenCV** - Image processing
- **uvicorn** - ASGI server

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **Python** 3.13+
- **uv** (Python package manager) or pip
- A webcam

### 1️⃣ Clone & Install

```bash
git clone <repository-url>
cd bridgio
```

### 2️⃣ Start ML Server

```bash
cd ML
uv sync                    # Install dependencies
uv run python app.py       # Start server on port 8000
```

Or with pip:
```bash
cd ML
pip install -r requirements.txt
python app.py
```

### 3️⃣ Start Backend

```bash
cd backend
pnpm install              # Install dependencies
pnpm dev                  # Start server on port 3000
```

### 4️⃣ Start Frontend

```bash
cd frontend
pnpm install              # Install dependencies
pnpm dev                  # Start dev server on port 5173
```

### 5️⃣ Open Browser

Navigate to **http://localhost:5173**

Allow camera access when prompted.

---

## 📚 Project Structure

```
bridgio/
├── frontend/              # React + TypeScript UI
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── CameraStream.tsx
│   │   │   ├── OutputBox.tsx
│   │   │   ├── HistoryPanel.tsx
│   │   │   ├── StatusIndicator.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   │   ├── useTranslationHistory.ts
│   │   │   ├── useTextToSpeech.ts
│   │   │   └── useTheme.ts
│   │   ├── App.tsx        # Main app component
│   │   ├── socket.ts      # Socket.IO client
│   │   └── types.ts       # TypeScript types
│   └── package.json
│
├── backend/               # Node.js WebSocket bridge
│   ├── server.js          # Express server
│   ├── socket.js          # Frontend WebSocket handler
│   ├── pythonClient.js    # ML server WebSocket client
│   └── package.json
│
└── ML/                    # Python ML server
    ├── app.py             # FastAPI application
    ├── classifier.py      # PyTorch inference
    ├── hand_tracking.py   # MediaPipe landmarks
    ├── model.py           # Neural network architecture
    ├── model.pt           # Trained weights
    ├── labels.json        # Sign labels
    └── dataset/           # Training data
```

---

## 🎨 UI Features

### Dark/Light Mode
Click the theme toggle (☀️/🌙) in the header to switch themes. Preference is saved to localStorage.

### Translation History
- Scrollable list of all recognized signs
- Timestamps for each entry
- 🔊 indicator for spoken words
- Clear history button

### Connection Status
Live indicator shows:
- ✅ **Connected** - All systems operational
- ❌ **Disconnected** - Connection lost (auto-reconnect)

### Camera Feed
- Live video preview
- Recording indicator
- Error messages if camera access denied

---

## 🔌 API Reference

### Backend → ML Server WebSocket

**Connection:** `ws://localhost:8000/ws`

**Send Frame:**
```json
{
  "frame": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Receive Prediction:**
```json
{
  "text": "HELLO"
}
```

### Frontend → Backend WebSocket

**Connection:** `http://localhost:3000`

**Events:**
- `frame` (client → server) - Send video frame
- `prediction` (server → client) - Receive translation

---

## 🧪 Supported Signs

The system currently recognizes 16 signs:

| Sign | Label |
|------|-------|
| 👍 | BUT |
| ✊ | DO |
| 👇 | DOWN |
| ❤️ | HEART |
| 🆘 | HELP |
| 🤟 | I LOVE YOU |
| 😘 | KISS |
| 👈 | ME |
| 👌 | OK |
| ✌️ | OR |
| ☮️ | PEACE |
| 🙏 | PRAY |
| 🤝 | SAME |
| 🛑 | STOP |
| 👉 | THAT |
| 👆 | UP |

---

## 🔧 Configuration

### Frontend
Edit [frontend/src/socket.ts](frontend/src/socket.ts):
```typescript
const socket = io("http://localhost:3000")  // Backend URL
```

### Backend
Edit [backend/pythonClient.js](backend/pythonClient.js):
```javascript
new WebSocket("ws://localhost:8000/ws")  // ML server URL
```

Environment variables:
```bash
PORT=3000  # Backend port
```

### ML Server
Edit [ML/app.py](ML/app.py):
```python
uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 🚀 Production Deployment

### 1️⃣ Build Frontend
```bash
cd frontend
pnpm build
# Output: dist/
```

Serve with nginx, Vercel, or Netlify.

### 2️⃣ Deploy Backend
```bash
cd backend
# Use PM2, Docker, or cloud service
pm2 start server.js --name sign-backend
```

### 3️⃣ Deploy ML Server
```bash
cd ML
# Use Docker or cloud GPU service
uvicorn app:app --host 0.0.0.0 --port 8000
```

### Docker Example
```dockerfile
# ML Server
FROM python:3.13
WORKDIR /app
COPY ML/ .
RUN pip install -r requirements.txt
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🌍 Ethical Considerations

### Accessibility First
- **Free for individuals** with disabilities
- No paywalls on core features
- WCAG 2.1 AA compliant design
- Keyboard navigation support

### Business Model
Revenue from:
- Educational institutions
- NGOs and government programs
- Corporate accessibility training
- Grants and donations

**Never charge disabled users.**

---

## 🔮 Future Enhancements

- [ ] **Dynamic signs** - LSTM for gesture sequences
- [ ] **Sentence formation** - Multi-word translation
- [ ] **Multilingual** - Support multiple sign languages
- [ ] **AR Glasses** - Real-time subtitles
- [ ] **Mobile apps** - iOS/Android deployment
- [ ] **Offline mode** - Local inference
- [ ] **Custom signs** - User-trained gestures
- [ ] **Analytics** - Usage insights (privacy-preserving)

---

## 🐛 Troubleshooting

### Camera not working
- Check browser permissions (chrome://settings/content/camera)
- Ensure no other app is using the camera
- Try a different browser

### ML Server won't start
```bash
# Check if model file exists
ls ML/model.pt

# Verify Python dependencies
cd ML
uv run python -c "import torch, mediapipe; print('OK')"
```

### Backend connection fails
```bash
# Check if ML server is running
curl http://localhost:8000/health

# Check backend logs
cd backend
pnpm dev
```

### No predictions appearing
- Ensure good lighting
- Keep hands visible in frame
- Check browser console for errors
- Verify WebSocket connections in DevTools

---

## 📄 License

MIT License - Free for educational and accessibility use.

---

## 👥 Contributing

Contributions welcome! Focus areas:
- New sign language support
- Accessibility improvements
- Performance optimization
- Documentation

---

## 🙏 Acknowledgments

- **MediaPipe** - Hand tracking
- **PyTorch** - Deep learning
- **FastAPI** - ML API framework
- **Socket.IO** - Real-time communication

---

## 📞 Support

For issues or questions:
1. Check documentation
2. Search existing issues
3. Create new issue with reproduction steps

**Built with ❤️ for accessibility and inclusion.**
