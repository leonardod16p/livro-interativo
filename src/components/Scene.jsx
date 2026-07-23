import { Stars } from '@react-three/drei'
import { Tree } from './Tree'
import { Walkway } from './Walkway'
import { WorldMarker } from './WorldMarker'
import { Character } from './Character'
import { CameraRig } from './CameraRig'
import { WORLDS } from '../data/worlds'

export function Scene({ playChime }) {
  return (
    <>
      <color attach="background" args={['#0b1620']} />
      <fog attach="fog" args={['#0b1620', 20, 70]} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[12, 30, 8]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight args={['#3a5a7a', '#1c140c', 0.4]} />

      <Stars radius={80} depth={40} count={2000} factor={2} saturation={0} fade />

      {/* chão */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[30, 48]} />
        <meshStandardMaterial color="#16241b" roughness={1} />
      </mesh>

      <Tree />
      <Walkway />

      {WORLDS.map((world) => (
        <WorldMarker key={world.id} world={world} />
      ))}

      <Character playChime={playChime} />
      <CameraRig />
    </>
  )
}
