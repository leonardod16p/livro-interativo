import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { pointOnTreePath } from '../utils/treePath'
import { useGameStore } from '../state/useGameStore'

export function WorldMarker({ phase }) {
  const ringRef = useRef()
  const { position } = pointOnTreePath(phase.t, 0)
  const completed = useGameStore((s) => s.completedMissions.includes(phase.id))

  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.4
  })

  return (
    <group position={position}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.025, 12, 40]} />
        <meshStandardMaterial
          color={phase.color}
          emissive={phase.color}
          emissiveIntensity={completed ? 0.4 : 1.6}
          roughness={0.3}
        />
      </mesh>
      <pointLight color={phase.color} intensity={completed ? 0.5 : 1.6} distance={3} />

      <Html
        position={[0, 0.7, 0]}
        center
        distanceFactor={10}
        occlude={false}
        style={{
          pointerEvents: 'none',
          fontFamily: 'Spectral, serif',
          color: '#f3ead9',
          textAlign: 'center',
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          whiteSpace: 'nowrap',
          opacity: completed ? 0.55 : 1,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700 }}>{phase.title}</div>
        <div style={{ fontSize: 9, opacity: 0.75, marginTop: 2 }}>
          {completed ? 'concluído' : phase.subtitle}
        </div>
      </Html>
    </group>
  )
}
