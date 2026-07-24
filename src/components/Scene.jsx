import { useMemo } from 'react'
import { Sky } from '@react-three/drei'
import * as THREE from 'three'
import Roots from './tree/Roots'
import Trunk from './tree/Trunk'
import Branches from './tree/Branches'
import Leaves from './tree/Leaves'
import { LeafLabels } from './tree/LeafLabels'
import { Character } from './Character'
import { CameraRig } from './CameraRig'
import { WorldMarker } from './WorldMarker'
import { Walkway } from './Walkway'
import { PHASES } from '../data/phases'
import { useGameStore } from '../state/useGameStore'
import { createSoilTexture, createGrassTexture } from '../utils/proceduralTextures'

const SOIL_RADIUS = 10.5
const SOIL_DEPTH = 7.6
const SUN_POSITION = [60, 45, 30]

export function Scene({ playChime, playStep }) {
  const revealedIds = useGameStore((s) => s.revealedLeafIds)
  const revealedLeafIds = useMemo(() => new Set(revealedIds), [revealedIds])

  const soilMap = useMemo(() => {
    const tex = createSoilTexture()
    tex.repeat.set(4, 4)
    tex.needsUpdate = true
    return tex
  }, [])

  const grassMap = useMemo(() => {
    const tex = createGrassTexture()
    tex.repeat.set(24, 24)
    tex.needsUpdate = true
    return tex
  }, [])

  return (
    <>
      <Sky
        sunPosition={SUN_POSITION}
        turbidity={6}
        rayleigh={1.4}
        mieCoefficient={0.006}
        mieDirectionalG={0.8}
      />
      <fog attach="fog" args={['#bcd9f0', 22, 55]} />

      <ambientLight intensity={0.65} />
      <directionalLight
        position={SUN_POSITION}
        intensity={2.2}
        color="#fff3d6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-far={80}
      />
      <hemisphereLight args={['#bcd9f0', '#3f6b3a', 0.5]} />
      <pointLight position={[0, -4, 6]} intensity={0.35} color="#a1887f" distance={20} />

      <group position={[0, -2.5, 0]}>
        {/* grama ao redor, com um vão no meio pra vitrine de solo */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <ringGeometry args={[SOIL_RADIUS, 60, 64]} />
          <meshStandardMaterial map={grassMap} roughness={1} side={THREE.DoubleSide} />
        </mesh>

        {/* vitrine de solo translúcida deixando as raízes visíveis por dentro */}
        <mesh position={[0, -SOIL_DEPTH / 2 + 0.05, 0]} receiveShadow>
          <cylinderGeometry args={[SOIL_RADIUS, SOIL_RADIUS * 0.82, SOIL_DEPTH, 48, 1, true]} />
          <meshStandardMaterial
            map={soilMap}
            color="#8d6e63"
            roughness={1}
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        <mesh position={[0, -SOIL_DEPTH + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[SOIL_RADIUS * 0.82, 48]} />
          <meshStandardMaterial color="#2b1d18" roughness={1} />
        </mesh>

        <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[SOIL_RADIUS - 0.15, SOIL_RADIUS + 0.05, 64]} />
          <meshStandardMaterial color="#1b1310" roughness={1} />
        </mesh>

        <Roots withering={false} />
        <Trunk withering={false} />
        <Branches withering={false} />
        <Leaves revealedLeafIds={revealedLeafIds} withering={false} />
        <LeafLabels />
        <Walkway />

        {PHASES.map((phase) => (
          <WorldMarker key={phase.id} phase={phase} />
        ))}

        <Character playChime={playChime} playStep={playStep} />
      </group>

      <CameraRig />
    </>
  )
}
