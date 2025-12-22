import cv2
import numpy as np
import os
import mediapipe as mp

SIGN_NAME = "HELLO"      # change this each time
SAMPLES = 200            # samples per sign

SAVE_DIR = f"dataset/{SIGN_NAME}"
os.makedirs(SAVE_DIR, exist_ok=True)

hands = mp.solutions.hands.Hands( #type: ignore
    max_num_hands=1,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6
)

cap = cv2.VideoCapture(0)
count = 0
landmarks = None

print(f"Collecting data for: {SIGN_NAME}")

while cap.isOpened() and count < SAMPLES:
    ret, frame = cap.read()
    if not ret:
        break

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)

    if results.multi_hand_landmarks:
        landmarks = []
        for lm in results.multi_hand_landmarks[0].landmark:
            landmarks.extend([lm.x, lm.y, lm.z])

        landmarks = np.array(landmarks, dtype=np.float32)

        cv2.putText(frame, f"Samples: {count}/{SAMPLES}",
                    (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)

    cv2.imshow("Collecting", frame)

    key = cv2.waitKey(1)
    if key == ord('s') and results.multi_hand_landmarks and landmarks is not None:
        np.save(f"{SAVE_DIR}/{count}.npy", landmarks)
        count += 1

    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
