import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import { UIOverlay } from './components/UIOverlay'
import { MissionPanel } from './components/MissionPanel'
import { StartScreen } from './components/StartScreen'
import { useGameStore } from './state/useGameStore'
import { useGameAudio } from './audio/useGameAudio'

export default function App() {
  const { playChime, startAmbient } = useGameAudio()
  const start = useGameStore((s) => s.start)

  const handleStart = () => {
    start()
    startAmbient()
  }

  return (
    <>
      <Canvas shadows camera={{ fov: 55, near: 0.1, far: 200 }}>
        <Suspense fallback={null}>
          <Scene playChime={playChime} />
        </Suspense>
      </Canvas>

      <UIOverlay />
      <MissionPanel />
      <StartScreen onStart={handleStart} />
    </>
  )
}
