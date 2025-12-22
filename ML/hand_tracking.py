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
    num_hands=1,
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

    landmarks = []
    for lm in result.hand_landmarks[0]:
        landmarks.extend([lm.x, lm.y, lm.z])

    return np.array(landmarks)
