import base64
import json
import cv2
import numpy as np
from fastapi import FastAPI, WebSocket
from hand_tracking import extract_landmarks
from classifier import predict

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    print("Node backend connected")

    while True:
        data = await ws.receive_text()
        payload = json.loads(data)

        frame_data = payload["frame"].split(",")[1]
        img_bytes = base64.b64decode(frame_data)

        np_img = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        landmarks = extract_landmarks(frame)

        if landmarks is None:
            await ws.send_text(json.dumps({"text": ""}))
            continue

        text = predict(landmarks)

        await ws.send_text(json.dumps({
            "text": text
        }))
