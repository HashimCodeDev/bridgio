import cv2
from hand_tracking import extract_landmarks
from classifier import predict

def main():
    cap = cv2.VideoCapture(0)
    
    print("Hand Gesture Recognition - Press 'q' to quit")
    print("Show hand gestures to the camera")
    print("-" * 50)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Extract hand landmarks
        landmarks = extract_landmarks(frame)
        
        # Predict gesture
        if landmarks is not None:
            text = predict(landmarks)
            
            # Display prediction on frame
            cv2.putText(frame, f"Gesture: {text}", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            print(f"Predicted: {text}")
        else:
            cv2.putText(frame, "No hand detected", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        # Show the frame
        cv2.imshow('Hand Gesture Recognition', frame)
        
        # Quit on 'q' key
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
