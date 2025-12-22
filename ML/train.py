import torch
import torch.nn as nn
from model import SignClassifier

X = torch.rand(500, 63)   # landmark vectors
y = torch.randint(0, 3, (500,))

model = SignClassifier(63, 3)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(50):
    optimizer.zero_grad()
    outputs = model(X)
    loss = criterion(outputs, y)
    loss.backward()
    optimizer.step()

torch.save(model.state_dict(), "model.pt")
print("Model saved")
