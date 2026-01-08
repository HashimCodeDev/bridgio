import torch
import json
import logging
import os
from model import SignClassifier

logger = logging.getLogger(__name__)

device = torch.device("cpu")

# Load labels
labels_path = "labels.json"
if not os.path.exists(labels_path):
    raise FileNotFoundError(f"Labels file not found: {labels_path}")

with open(labels_path) as f:
    LABELS = json.load(f)

logger.info(f"Loaded {len(LABELS)} sign labels")

# Load model
model_path = "model.pt"
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found: {model_path}")

model = SignClassifier(input_size=126, num_classes=len(LABELS))
try:
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    logger.info(f"✅ Model loaded successfully from {model_path}")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    raise

def predict(landmarks):
    """
    Predict sign language gesture from hand landmarks.
    
    Args:
        landmarks: numpy array of shape (126,) containing hand landmark coordinates
        
    Returns:
        str: Predicted sign label
    """
    try:
        x = torch.tensor(landmarks, dtype=torch.float32).unsqueeze(0)

        with torch.no_grad():
            outputs = model(x)
            predicted = torch.argmax(outputs, dim=1).item()

        return LABELS[str(predicted)]
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return ""
