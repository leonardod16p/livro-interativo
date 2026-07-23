import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { pointOnSpiral, TREE } from '../utils/spiral'

const SEGMENTS = 260

export function Walkway() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useLayoutEffect(() => {
    if (!meshRef.current) return
    for (let i = 0; i < SEGMENTS; i++) {
      const t = i / (SEGMENTS - 1)
      const { position, yaw } = pointOnSpiral(t, 0)
      dummy.position.set(position[0], position[1] - 0.08, position[2])
      dummy.rotation.set(0, yaw, 0)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [dummy])

  return (
    <instancedMesh ref={meshRef} args={[null, null, SEGMENTS]} castShadow receiveShadow>
      <boxGeometry args={[TREE.pathWidth + 0.3, 0.16, 0.62]} />
      <meshStandardMaterial color="#7a5a3a" roughness={0.9} />
    </instancedMesh>
  )
}
