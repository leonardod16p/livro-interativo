import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { pointOnTreePath } from '../utils/treePath'
import { useGameStore } from '../state/useGameStore'

const desired = new THREE.Vector3()
const lookAt = new THREE.Vector3()
const outward = new THREE.Vector3()

export function CameraRig() {
  const { camera } = useThree()

  useFrame((_, delta) => {
    const { pathProgress, lateral, cameraDistance } = useGameStore.getState()
    const { position } = pointOnTreePath(pathProgress, lateral)

    outward.set(position[0], 0, position[2]).normalize()

    // quanto mais afastado (zoom out), mais alto também fica a câmera —
    // dá uma visão de conjunto da árvore em vez de só afastar reto
    const heightOffset = 0.9 + cameraDistance * 0.28

    desired.set(
      position[0] + outward.x * cameraDistance,
      position[1] + heightOffset,
      position[2] + outward.z * cameraDistance
    )

    camera.position.lerp(desired, 1 - Math.pow(0.001, delta))

    lookAt.set(position[0], position[1] + 0.4, position[2])
    const currentLook = camera.userData.lookAt || lookAt.clone()
    currentLook.lerp(lookAt, 1 - Math.pow(0.001, delta))
    camera.userData.lookAt = currentLook
    camera.lookAt(currentLook)
  })

  return null
}
