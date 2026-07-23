import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { pointOnSpiral } from '../utils/spiral'
import { useGameStore } from '../state/useGameStore'

export function WorldMarker({ world }) {
  const ringRef = useRef()
  const { position } = pointOnSpiral(world.t, 0)
  const completed = useGameStore((s) => s.completedMissions.includes(world.id))

  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.4
  })

  return (
    <group position={position}>
      {/* anel flutuante que marca a entrada do mundo */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.05, 12, 40]} />
        <meshStandardMaterial
          color={world.color}
          emissive={world.color}
          emissiveIntensity={completed ? 0.4 : 1.6}
          roughness={0.3}
        />
      </mesh>
      <pointLight color={world.color} intensity={completed ? 0.6 : 2} distance={6} />

      <Html
        position={[0, 1.6, 0]}
        center
        distanceFactor={12}
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
        <div style={{ fontSize: 14, fontWeight: 700 }}>{world.title}</div>
        <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>
          {completed ? 'concluído' : world.subtitle}
        </div>
      </Html>
    </group>
  )
}
