import CameraStream from "./components/CameraStream"
import OutputBox from "./components/OutputBox"

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Sign → Text / Speech</h1>
      </header>
      <main className="app-main">
        <div className="camera-container">
          <CameraStream />
        </div>
        <div className="output-container">
          <OutputBox />
        </div>
      </main>
    </div>
  )
}
