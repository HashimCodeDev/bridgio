# System Architecture

## Overview

Sign Language Translator is a three-tier real-time translation system with strict separation of concerns.

```
┌──────────────────────────────────────────────────────┐
│                    BROWSER CLIENT                     │
│  ┌────────────────────────────────────────────────┐  │
│  │  React UI Layer                                │  │
│  │  - Camera capture (WebRTC)                     │  │
│  │  - Canvas frame extraction                     │  │
│  │  - Translation display                         │  │
│  │  - Text-to-Speech (Web Speech API)            │  │
│  │  - Theme management                            │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────┘
                   │
                   │ Socket.IO (WebSocket)
                   │ Bidirectional
                   │
┌──────────────────▼───────────────────────────────────┐
│               NODE.JS BACKEND                         │
│  ┌────────────────────────────────────────────────┐  │
│  │  Communication Bridge                          │  │
│  │  - Socket.IO server (frontend)                │  │
│  │  - WebSocket client (ML)                      │  │
│  │  - Request routing                            │  │
│  │  - Multi-client management                    │  │
│  │  - Automatic reconnection                     │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────┘
                   │
                   │ WebSocket
                   │ Bidirectional
                   │
┌──────────────────▼───────────────────────────────────┐
│               PYTHON ML SERVER                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  Machine Learning Pipeline                     │  │
│  │  1. Base64 decode                             │  │
│  │  2. Image decode (OpenCV)                     │  │
│  │  3. Hand landmark extraction (MediaPipe)      │  │
│  │  4. Feature vector (21 × 3 × 2 = 126)        │  │
│  │  5. Neural network inference (PyTorch)        │  │
│  │  6. Label prediction                          │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## Data Flow

### Frame Processing Pipeline

```
1. CAPTURE (Frontend)
   Camera → Video Element → Canvas → JPEG → Base64
   Rate: 10 FPS (configurable)

2. TRANSPORT (Backend)
   Frontend ──Socket.IO──> Backend ──WebSocket──> ML Server

3. PROCESS (ML Server)
   a. Decode: Base64 → NumPy array → OpenCV image
   b. Extract: MediaPipe → 21 hand landmarks × 2 hands × (x,y,z)
   c. Normalize: 126-element feature vector
   d. Predict: PyTorch model → Softmax → Argmax → Label

4. RETURN (Backend)
   ML Server ──WebSocket──> Backend ──Socket.IO──> Frontend

5. DISPLAY (Frontend)
   JSON → React State → DOM Update
   JSON → Speech Synthesis → Audio Output
   JSON → History Array → Scrollable List
```

### Message Format

**Frontend → Backend:**
```json
{
  "event": "frame",
  "data": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Backend → ML Server:**
```json
{
  "frame": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**ML Server → Backend:**
```json
{
  "text": "HELLO"
}
```

**Backend → Frontend:**
```json
{
  "event": "prediction",
  "data": {
    "text": "HELLO"
  }
}
```

---

## Component Responsibilities

### Frontend (React)

**MUST:**
- Capture webcam video
- Extract frames using Canvas API
- Send frames via WebSocket
- Display current translation
- Maintain translation history
- Convert text to speech
- Manage UI state (theme, connection)
- Handle user interactions

**MUST NOT:**
- Process images
- Extract landmarks
- Run ML models
- Store sensitive data

**Dependencies:**
- `react` - UI framework
- `socket.io-client` - WebSocket communication
- Browser APIs: WebRTC, Canvas, Web Speech

### Backend (Node.js)

**MUST:**
- Accept WebSocket connections from frontend
- Maintain WebSocket connection to ML server
- Route frames from frontend to ML
- Route predictions from ML to frontend
- Handle reconnections gracefully
- Log errors and events
- Support multiple concurrent clients

**MUST NOT:**
- Decode images
- Extract features
- Run ML inference
- Store frame data

**Dependencies:**
- `express` - HTTP server
- `socket.io` - Frontend WebSocket server
- `ws` - ML server WebSocket client

### ML Server (Python)

**MUST:**
- Accept WebSocket connections
- Decode base64 images
- Extract hand landmarks
- Run model inference
- Return predictions
- Handle errors gracefully
- Log processing steps

**MUST NOT:**
- Manage frontend state
- Handle UI logic
- Store user data long-term

**Dependencies:**
- `fastapi` - Web framework
- `mediapipe` - Hand tracking
- `torch` - Deep learning
- `opencv-python` - Image processing

---

## Scalability Considerations

### Horizontal Scaling

#### Frontend
- Static files → CDN
- Multiple instances via load balancer
- Client-side rendering

#### Backend
- Stateless design enables replication
- Socket.IO sticky sessions required
- Redis adapter for multi-instance Socket.IO

```javascript
// Example: Redis adapter
const io = new Server(server, {
  adapter: createAdapter(pubClient, subClient)
})
```

#### ML Server
- CPU: Multiple uvicorn workers
- GPU: Model parallelism or batch inference
- Containerization (Docker/K8s)

```bash
# Multiple workers
uvicorn app:app --workers 4
```

### Vertical Scaling

#### ML Server
- GPU acceleration: `device = torch.device("cuda")`
- Model quantization for CPU efficiency
- Batch processing for throughput

```python
# GPU inference
model.to(device)
x = x.to(device)
```

### Optimization Strategies

1. **Frame Rate Throttling**
   - Reduce from 10 FPS to 5 FPS for slower networks
   - Adaptive frame rate based on latency

2. **Image Compression**
   - Reduce JPEG quality (current: 0.8)
   - Resize frames before encoding

3. **Model Optimization**
   - ONNX export for cross-platform
   - TensorRT for NVIDIA GPUs
   - Quantization (FP16, INT8)

4. **Caching**
   - Landmark caching for duplicate frames
   - Prediction caching for static signs

---

## Security Architecture

### Authentication (Future)
```
User → OAuth2/JWT → Backend → Verify → ML Server
```

### Data Privacy
- No frame storage
- No user tracking
- No personally identifiable information (PII)
- GDPR/CCPA compliant

### Network Security
- HTTPS in production
- WSS (WebSocket Secure)
- CORS restrictions
- Rate limiting

```javascript
// CORS example
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS.split(','),
    credentials: true
  }
})
```

### Model Security
- Model file integrity checks
- Input validation
- Output sanitization
- DoS prevention (rate limiting)

---

## Error Handling

### Frontend
```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia(...)
} catch (error) {
  showError("Camera access denied")
}

socket.on('connect_error', (error) => {
  showStatus("Disconnected - Reconnecting...")
})
```

### Backend
```javascript
socket.on('frame', async (frame) => {
  try {
    const prediction = await mlClient.predict(frame)
    socket.emit('prediction', prediction)
  } catch (error) {
    logger.error('Prediction failed:', error)
    socket.emit('prediction', { text: '', error: error.message })
  }
})
```

### ML Server
```python
try:
    landmarks = extract_landmarks(frame)
    if landmarks is None:
        return {"text": ""}
    prediction = predict(landmarks)
    return {"text": prediction}
except Exception as e:
    logger.error(f"Processing error: {e}")
    return {"text": "", "error": str(e)}
```

---

## Deployment Architecture

### Development
```
localhost:5173 (Frontend)
localhost:3000 (Backend)
localhost:8000 (ML)
```

### Production

#### Option 1: Monolithic
```
[Nginx] → Frontend (static)
        → Backend (Node)
        → ML Server (Python)
```

#### Option 2: Microservices
```
[CDN] → Frontend (Vercel/Netlify)

[Load Balancer] → Backend Instances (AWS ECS)
                → ML Server Instances (AWS SageMaker)

[Redis] ← Backend (Socket.IO adapter)
```

#### Option 3: Serverless
```
Frontend → S3 + CloudFront
Backend → AWS Lambda + API Gateway
ML → AWS Lambda (CPU) or SageMaker (GPU)
```

---

## Monitoring & Observability

### Metrics to Track

**Frontend:**
- Frame capture rate
- WebSocket connection status
- Speech synthesis success rate
- User interactions

**Backend:**
- Active connections
- Messages per second
- Error rate
- Latency (frontend ↔ ML)

**ML Server:**
- Inference time
- Landmark detection success rate
- Model accuracy
- GPU/CPU utilization

### Logging Strategy

```
Frontend → Browser Console (dev) / Sentry (prod)
Backend → Winston / Pino → CloudWatch / ELK
ML → Python logging → CloudWatch / ELK
```

### Health Checks

**Backend:**
```bash
GET /health → { status: "healthy", uptime: 12345 }
```

**ML Server:**
```bash
GET /health → { status: "healthy", model_loaded: true }
```

---

## Technology Choices Rationale

| Component | Technology | Why? |
|-----------|-----------|------|
| Frontend | React | Component reusability, ecosystem |
| UI | TypeScript | Type safety, developer experience |
| Communication | Socket.IO | Bidirectional, reconnection, room support |
| Backend | Node.js | Non-blocking I/O, JavaScript ecosystem |
| ML Framework | PyTorch | Flexibility, research-friendly |
| Hand Tracking | MediaPipe | Accurate, fast, production-ready |
| Web Server (ML) | FastAPI | Async, WebSocket support, docs |

---

## Future Architecture

### Phase 1: Current (Static Signs)
- 16 word-level signs
- Single-frame classification
- Real-time inference

### Phase 2: Dynamic Signs (LSTM)
- Temporal sequences
- Multi-word phrases
- Context awareness

```python
# LSTM architecture
class DynamicSignClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.lstm = nn.LSTM(126, 256, 2, batch_first=True)
        self.fc = nn.Linear(256, num_classes)
```

### Phase 3: Multi-Language
- Multiple sign language models (ASL, BSL, ISL)
- Language detection
- Translation between sign languages

### Phase 4: Edge Deployment
- ONNX models
- TensorFlow Lite
- Mobile apps (React Native)
- Smart glasses (Android/iOS)

---

## Performance Benchmarks

### Current System (CPU)

| Metric | Value |
|--------|-------|
| Frame capture | ~10 FPS |
| Frame encoding | ~5ms |
| Network latency | ~10-50ms |
| Landmark extraction | ~20-50ms |
| Model inference | ~10-30ms |
| **Total latency** | **50-150ms** |

### Target (GPU)

| Metric | Target |
|--------|--------|
| Total latency | <50ms |
| Throughput | 30+ FPS |
| Accuracy | >95% |

---

**Last Updated:** January 2026  
**Version:** 1.0.0
