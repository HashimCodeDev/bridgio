# Frontend - Sign Language Translator

React + TypeScript UI for real-time sign language translation.

## Features

- 📹 **Webcam Capture** - Real-time video feed
- 💬 **Translation Display** - Current sign + history
- 🔊 **Text-to-Speech** - Auto-speak with deduplication
- 🎨 **Modern UI** - Dark/light themes, responsive
- ♿ **Accessible** - WCAG compliant, keyboard navigation
- 🔌 **Live Status** - Connection indicators

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- Socket.IO Client
- Web Speech API
- CSS3 (no UI library dependencies)

## Development

```bash
# Install dependencies
pnpm install

# Start dev server (port 5173)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Environment

The frontend connects to the backend at `http://localhost:3000` by default.

To change this, edit [src/socket.ts](src/socket.ts):
```typescript
const socket = io("http://your-backend-url")
```

## Component Structure

```
src/
├── components/
│   ├── CameraStream.tsx       # Webcam + frame capture
│   ├── OutputBox.tsx          # Current translation
│   ├── HistoryPanel.tsx       # Translation history
│   ├── StatusIndicator.tsx    # Connection status
│   └── ThemeToggle.tsx        # Dark/light mode
├── hooks/
│   ├── useTranslationHistory.ts  # History state management
│   ├── useTextToSpeech.ts        # TTS with deduplication
│   └── useTheme.ts               # Theme persistence
├── App.tsx                    # Main component
├── socket.ts                  # Socket.IO client
└── types.ts                   # TypeScript interfaces
```

## Key Features Implementation

### History Management
- Stores all translations with timestamps
- Prevents duplicate speech output
- Scrollable, chat-style UI
- Clear history button

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Reduced motion support
- High contrast colors

### Performance
- 10 FPS frame capture (configurable)
- Efficient re-renders with React hooks
- Debounced speech synthesis
- Canvas-based image capture

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- WebRTC (camera access)
- Canvas API
- WebSocket support
- Web Speech API

## Troubleshooting

**Camera permission denied:**
- Check browser settings
- Use HTTPS in production
- Try different browser

**No connection:**
- Ensure backend is running on port 3000
- Check browser console for errors
- Verify CORS settings

**No speech output:**
- Check browser audio permissions
- Verify Web Speech API support
- Try different voice in browser settings

import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
