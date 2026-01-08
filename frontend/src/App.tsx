import { useState, useEffect } from "react"
import CameraStream from "./components/CameraStream"
import OutputBox from "./components/OutputBox"
import StatusIndicator from "./components/StatusIndicator"
import ThemeToggle from "./components/ThemeToggle"
import { useTheme } from "./hooks/useTheme"
import type { ConnectionStatus } from "./types"
import socket from "./socket"

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false
  })

  useEffect(() => {
    const handleConnect = () => {
      setConnectionStatus({ connected: true })
    }

    const handleDisconnect = () => {
      setConnectionStatus({
        connected: false,
        error: 'Connection lost. Reconnecting...'
      })
    }

    const handleError = (error: Error) => {
      setConnectionStatus({
        connected: false,
        error: error.message
      })
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleError)

    // Check initial connection
    if (socket.connected) {
      setConnectionStatus({ connected: true })
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleError)
    }
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>
            <span className="header-icon" aria-label="Sign language">🤟</span>
            Sign Language Translator
          </h1>
          <p className="header-subtitle">Real-time translation for accessibility</p>
        </div>
        <div className="header-controls">
          <StatusIndicator status={connectionStatus} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="app-main">
        <div className="main-content">
          <div className="camera-container">
            <CameraStream />
          </div>
          <div className="output-container">
            <OutputBox />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          <strong>Accessibility First:</strong> Free for individuals with disabilities.
          Built with ❤️ for everyone.
        </p>
      </footer>
    </div>
  )
}
