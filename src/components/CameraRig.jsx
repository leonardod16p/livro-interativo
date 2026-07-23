import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { pointOnSpiral } from '../utils/spiral'
import { useGameStore } from '../state/useGameStore'

const desired = new THREE.Vector3()
const lookAt = new THREE.Vector3()
const outward = new THREE.Vector3()

export function CameraRig() {
  const { camera } = useThree()

  useFrame((_, delta) => {
    const { pathProgress, lateral } = useGameStore.getState()
    const { position } = pointOnSpiral(pathProgress, lateral)

    // vetor "pra fora" do tronco, é onde posicionamos a câmera
    // (assim ela nunca fica atravessando a árvore)
    outward.set(position[0], 0, position[2]).normalize()

    desired.set(
      position[0] + outward.x * 5,
      position[1] + 2.1,
      position[2] + outward.z * 5
    )

    camera.position.lerp(desired, 1 - Math.pow(0.001, delta))

    lookAt.set(position[0], position[1] + 0.5, position[2])
    const currentLook = camera.userData.lookAt || lookAt.clone()
    currentLook.lerp(lookAt, 1 - Math.pow(0.001, delta))
    camera.userData.lookAt = currentLook
    camera.lookAt(currentLook)
  })

  return null
}
