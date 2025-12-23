import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np

BaseOptions = python.BaseOptions
HandLandmarker = vision.HandLandmarker
HandLandmarkerOptions = vision.HandLandmarkerOptions
VisionRunningMode = vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path='hand_landmarker.task'),
    running_mode=VisionRunningMode.VIDEO,
    num_hands=2,
    min_hand_detection_confidence=0.6,
    min_tracking_confidence=0.6
)

hands = HandLandmarker.create_from_options(options)

# Frame counter for VIDEO mode
frame_timestamp_ms = 0

def extract_landmarks(image):
    global frame_timestamp_ms
    
    # Convert BGR to RGB
    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Create MediaPipe Image
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
    
    # Detect hand landmarks
    result = hands.detect_for_video(mp_image, frame_timestamp_ms)
    frame_timestamp_ms += 33  # ~30fps
    
    if not result.hand_landmarks:
        return None

    # Initialize landmarks array for 2 hands (126 features)
    landmarks = np.zeros(126, dtype=np.float32)
    
    # Sort hands by handedness (Left=0, Right=1) for consistency
    hand_data = list(zip(result.hand_landmarks, result.handedness))
    hand_data.sort(key=lambda x: 0 if x[1][0].category_name == 'Left' else 1)
    
    # Extract landmarks for each detected hand
    for idx, (hand_landmarks, _) in enumerate(hand_data[:2]):
        offset = idx * 63  # 63 features per hand
        for i, lm in enumerate(hand_landmarks):
            landmarks[offset + i*3] = lm.x
            landmarks[offset + i*3 + 1] = lm.y
            landmarks[offset + i*3 + 2] = lm.z

    return landmarks
