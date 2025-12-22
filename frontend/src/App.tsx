import CameraStream from "./components/CameraStream"
import OutputBox from "./components/OutputBox"

export default function App() {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Sign → Text / Speech</h1>
      <CameraStream />
      <OutputBox />
    </div>
  )
}
