import torch
import json
from model import SignClassifier

device = torch.device("cpu")

with open("labels.json") as f:
    LABELS = json.load(f)

model = SignClassifier(input_size=126, num_classes=len(LABELS))
model.load_state_dict(torch.load("model.pt", map_location=device))
model.eval()

def predict(landmarks):
    x = torch.tensor(landmarks, dtype=torch.float32).unsqueeze(0)

    with torch.no_grad():
        outputs = model(x)
        predicted = torch.argmax(outputs, dim=1).item()

    return LABELS[str(predicted)]
