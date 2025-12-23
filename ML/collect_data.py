import cv2
import numpy as np
import os
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

SIGN_NAME = "OR"      # change this each time
SAMPLES = 75             # samples per sign (per person)

SAVE_DIR = f"dataset/{SIGN_NAME}"
os.makedirs(SAVE_DIR, exist_ok=True)

# Find the highest existing sample number
existing_files = [f for f in os.listdir(SAVE_DIR) if f.endswith('.npy')]
if existing_files:
    existing_numbers = [int(f.split('.')[0]) for f in existing_files]
    start_count = max(existing_numbers) + 1
else:
    start_count = 0

BaseOptions = python.BaseOptions
HandLandmarker = vision.HandLandmarker
HandLandmarkerOptions = vision.HandLandmarkerOptions
VisionRunningMode = vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path='hand_landmarker.task'),
    running_mode=VisionRunningMode.VIDEO,
    num_hands=1,
    min_hand_detection_confidence=0.6,
    min_tracking_confidence=0.6
)

hands = HandLandmarker.create_from_options(options)
frame_timestamp_ms = 0

cap = cv2.VideoCapture(0)
count = start_count
landmarks = None

print(f"Collecting data for: {SIGN_NAME}")
print(f"Starting from sample {start_count}, collecting {SAMPLES} more samples")
print(f"Will save samples {start_count} to {start_count + SAMPLES - 1}")

while cap.isOpened() and count < start_count + SAMPLES:
    ret, frame = cap.read()
    if not ret:
        break

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
    
    results = hands.detect_for_video(mp_image, frame_timestamp_ms)
    frame_timestamp_ms += 33  # ~30fps

    if results.hand_landmarks:
        landmarks = []
        for lm in results.hand_landmarks[0]:
            landmarks.extend([lm.x, lm.y, lm.z])

        landmarks = np.array(landmarks, dtype=np.float32)

        cv2.putText(frame, f"Samples: {count - start_count}/{SAMPLES}",
                    (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)

    cv2.imshow("Collecting", frame)

    key = cv2.waitKey(1)
    if key == ord('s') and results.hand_landmarks and landmarks is not None:
        np.save(f"{SAVE_DIR}/{count}.npy", landmarks)
        count += 1

    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
