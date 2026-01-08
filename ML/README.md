# ML Server - Sign Language Translator

Python FastAPI server for real-time sign language recognition.

## Purpose

Converts hand gestures → text using:
1. **MediaPipe** - Hand landmark detection
2. **PyTorch** - Deep learning classification

## Tech Stack

- Python 3.13+
- FastAPI - Web framework
- MediaPipe - Hand tracking (21 landmarks × 2 hands)
- PyTorch - Neural network inference
- OpenCV - Image decoding
- uvicorn - ASGI server

## Quick Start

```bash
# Install dependencies with uv (recommended)
uv sync

# Or with pip
pip install -r requirements.txt

# Start server (port 8000)
uv run python app.py
# or
python app.py
```

## Model Details

### Input
- 126 features: 21 landmarks × 3 coords (x,y,z) × 2 hands
- Normalized coordinates from MediaPipe

### Architecture
- Fully connected neural network
- Input: 126 → Hidden layers → Output: 16 classes

### Output
- 16 sign language words (see `labels.json`)

### Training
See [train.py](train.py) for training code.

Dataset in `dataset/` folder (organized by sign label).

## API Reference

### Health Check
```bash
GET http://localhost:8000/health

Response:
{
  "status": "healthy",
  "service": "sign-language-ml",
  "model_loaded": true
}
```

### WebSocket Endpoint
```
ws://localhost:8000/ws
```

**Send:**
```json
{
  "frame": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Receive:**
```json
{
  "text": "HELLO"
}
```

Empty string if no hand detected.

## File Structure

```
ML/
├── app.py              # FastAPI server
├── classifier.py       # PyTorch inference
├── hand_tracking.py    # MediaPipe landmarks
├── model.py            # Network architecture
├── model.pt            # Trained weights
├── labels.json         # Sign label mapping
├── train.py            # Training script
├── collect_data.py     # Data collection tool
├── test.py             # Model evaluation
└── dataset/            # Training data
    ├── BUT/
    ├── DO/
    └── ...
```

## Features

### Robust Hand Tracking
- Handles 1 or 2 hands
- Consistent left/right ordering
- Missing hand → zero padding
- Confidence thresholds

### Error Handling
- Invalid frames → empty response
- No hands → empty response
- JSON errors → logged + handled
- Model errors → logged + handled

### Logging
- Client connections
- Frame processing
- Prediction results
- Errors and warnings

## Configuration

### MediaPipe Settings
Edit [hand_tracking.py](hand_tracking.py):
```python
HandLandmarkerOptions(
    num_hands=2,                       # Max hands to detect
    min_hand_detection_confidence=0.6, # Detection threshold
    min_tracking_confidence=0.6        # Tracking threshold
)
```

### Model Path
Edit [classifier.py](classifier.py):
```python
model.load_state_dict(torch.load("model.pt"))
```

## Performance

- **Inference:** ~10-30ms per frame (CPU)
- **Hand tracking:** ~20-50ms per frame
- **Total latency:** ~50-100ms

GPU support:
```python
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
```

## Training

### Collect Data
```bash
python collect_data.py
# Follow prompts to collect samples
```

### Train Model
```bash
python train.py
# Saves model.pt
```

### Evaluate
```bash
python test.py
# Shows accuracy metrics
```

## Adding New Signs

1. **Collect data:**
   ```bash
   python collect_data.py
   # Select new sign label
   # Record ~200 samples
   ```

2. **Update labels.json:**
   ```json
   {
     "16": "NEW_SIGN"
   }
   ```

3. **Retrain:**
   ```bash
   python train.py
   ```

4. **Test:**
   ```bash
   python test.py
   ```

## Deployment

### Production Mode
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker
```dockerfile
FROM python:3.13-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Deployment
- **CPU:** AWS EC2, Google Cloud Run
- **GPU:** AWS SageMaker, Google AI Platform
- **Serverless:** AWS Lambda (with cold start tradeoff)

## Troubleshooting

**Model file not found:**
- Ensure `model.pt` exists
- Run training script
- Check file permissions

**MediaPipe errors:**
- Verify `hand_landmarker.task` file exists
- Check OpenCV installation
- Try different image formats

**Poor accuracy:**
- Collect more training data
- Increase model capacity
- Adjust confidence thresholds
- Improve lighting/camera quality

**High latency:**
- Use GPU for inference
- Reduce image resolution
- Optimize model architecture
- Use batch processing

## Future Improvements

- [ ] LSTM for dynamic gestures
- [ ] Multi-language support
- [ ] Model quantization (faster CPU)
- [ ] ONNX export for edge devices
- [ ] Continuous learning pipeline
