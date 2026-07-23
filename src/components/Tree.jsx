import { TREE } from '../utils/spiral'

// Tronco construído com segmentos empilhados que afinam sutilmente,
// pra não parecer um cilindro perfeito e artificial.
export function Tree() {
  const segments = 10
  const segHeight = TREE.totalHeight / segments

  return (
    <group>
      {/* raízes */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 2.4, 0.3, Math.sin(angle) * 2.4]}
            rotation={[0, -angle, Math.PI / 10]}
            castShadow
            receiveShadow
          >
            <coneGeometry args={[0.5, 2.2, 6]} />
            <meshStandardMaterial color="#3a281c" roughness={1} />
          </mesh>
        )
      })}

      {/* tronco */}
      {[...Array(segments)].map((_, i) => {
        const radius = THREE_lerp(TREE.trunkRadius, TREE.trunkRadius * 0.55, i / segments)
        return (
          <mesh
            key={i}
            position={[0, segHeight * i + segHeight / 2, 0]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[radius * 0.94, radius, segHeight * 1.02, 12]} />
            <meshStandardMaterial color="#4a3324" roughness={0.95} />
          </mesh>
        )
      })}

      {/* copa no topo */}
      <group position={[0, TREE.totalHeight + 2, 0]}>
        {[...Array(9)].map((_, i) => {
          const a = (i / 9) * Math.PI * 2
          const r = 3 + (i % 3)
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * r, Math.sin(i) * 1.5, Math.sin(a) * r]}
              castShadow
            >
              <icosahedronGeometry args={[2.4 + (i % 2), 1]} />
              <meshStandardMaterial color="#6b8f3a" roughness={0.8} flatShading />
            </mesh>
          )
        })}
        <mesh castShadow>
          <icosahedronGeometry args={[3.6, 1]} />
          <meshStandardMaterial color="#7fa347" roughness={0.8} flatShading />
        </mesh>
      </group>
    </group>
  )
}

function THREE_lerp(a, b, t) {
  return a + (b - a) * t
}
