import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { pointOnTreePath, TREE_PATH } from '../utils/treePath'

// densidade de "tábuas" ao longo da trilha — bem mais que o número de
// voltas pra ficar contínua e parecer uma escada/passarela de verdade
const SEGMENTS = 320

export function Walkway() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useLayoutEffect(() => {
    if (!meshRef.current) return
    for (let i = 0; i < SEGMENTS; i++) {
      const t = i / (SEGMENTS - 1)
      const { position, yaw } = pointOnTreePath(t, 0)
      dummy.position.set(position[0], position[1] - 0.07, position[2])
      dummy.rotation.set(0, yaw, 0)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [dummy])

  return (
    <instancedMesh ref={meshRef} args={[null, null, SEGMENTS]} castShadow receiveShadow>
      <boxGeometry args={[TREE_PATH.pathWidth + 0.35, 0.09, 0.4]} />
      <meshStandardMaterial color="#7a5a3a" roughness={0.9} />
    </instancedMesh>
  )
}
