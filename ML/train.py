import os
import json
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from model import SignClassifier

class SignDataset(Dataset):
    def __init__(self, root_dir):
        self.samples = []
        self.labels = []
        self.label_map = {}

        for idx, label in enumerate(sorted(os.listdir(root_dir))):
            self.label_map[idx] = label
            for file in os.listdir(os.path.join(root_dir, label)):
                self.samples.append(
                    np.load(os.path.join(root_dir, label, file))
                )
                self.labels.append(idx)

        self.samples = torch.tensor(np.array(self.samples), dtype=torch.float32)
        self.labels = torch.tensor(np.array(self.labels))

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return self.samples[idx], self.labels[idx]

dataset = SignDataset("dataset")
loader = DataLoader(dataset, batch_size=32, shuffle=True)

model = SignClassifier(input_size=126, num_classes=len(dataset.label_map))
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(40):
    total_loss = 0
    for x, y in loader:
        optimizer.zero_grad()
        output = model(x)
        loss = criterion(output, y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    print(f"Epoch {epoch+1}, Loss: {total_loss:.4f}")

torch.save(model.state_dict(), "model.pt")

# Save label mapping
with open("labels.json", "w") as f:
    json.dump({str(k): v for k, v in dataset.label_map.items()}, f, indent=4)

print("Training complete. Model saved.")
print(f"Label mapping: {dataset.label_map}")
