import base64
import json
import logging
import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from hand_tracking import extract_landmarks
from classifier import predict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Sign Language ML Service", version="1.0.0")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "sign-language-ml",
        "model_loaded": True
    }

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    client_id = id(ws)
    logger.info(f"✅ Backend connected (Client ID: {client_id})")

    try:
        while True:
            try:
                data = await ws.receive_text()
                payload = json.loads(data)

                # Decode frame
                frame_data = payload["frame"].split(",")[1]
                img_bytes = base64.b64decode(frame_data)
                np_img = np.frombuffer(img_bytes, np.uint8)
                frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

                if frame is None:
                    logger.warning("Failed to decode frame")
                    await ws.send_text(json.dumps({"text": ""}))
                    continue

                # Extract landmarks
                landmarks = extract_landmarks(frame)

                if landmarks is None:
                    await ws.send_text(json.dumps({"text": ""}))
                    continue

                # Predict sign
                text = predict(landmarks)

                # Send prediction
                await ws.send_text(json.dumps({"text": text}))

            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {e}")
                await ws.send_text(json.dumps({"text": "", "error": "Invalid data"}))
            except Exception as e:
                logger.error(f"Error processing frame: {e}")
                await ws.send_text(json.dumps({"text": "", "error": str(e)}))

    except WebSocketDisconnect:
        logger.info(f"❌ Backend disconnected (Client ID: {client_id})")
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {e}")

if __name__ == "__main__":
    import uvicorn
    logger.info("""
╔═══════════════════════════════════════════╗
║   🤖 Sign Language ML Server             ║
║   Port: 8000                              ║
║   Status: Starting...                     ║
╚═══════════════════════════════════════════╝
    """)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
