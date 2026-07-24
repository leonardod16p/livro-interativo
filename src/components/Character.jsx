import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useKeyboard } from '../hooks/useKeyboard'
import { pointOnTreePath, clampLateral } from '../utils/treePath'
import { useGameStore } from '../state/useGameStore'
import { PHASES } from '../data/phases'

const CLIMB_SPEED = 0.045 // progresso (0..1) por segundo, subindo/descendo
const LATERAL_SPEED = 0.6 // unidades por segundo, andando de lado agarrado à casca
const STEP_INTERVAL = 0.32 // segundos entre sons de passo, enquanto anda

const MODEL_URL = `${import.meta.env.BASE_URL}models/fox.glb`

// Árvore real é bem menor/mais fina que o mundo abstrato do projeto base
// (tronco com raio ~0.5-0.9 contra 2.2 antes) — a raposa precisa encolher
// na mesma proporção pra não parecer gigante colada no tronco.
const MODEL_SCALE = 0.006

const MODEL_FACING_OFFSET = Math.PI

export function Character({ playChime, playStep }) {
  const groupRef = useRef()
  const modelRef = useRef()
  const keys = useKeyboard()
  const currentYaw = useRef(0)
  const currentAction = useRef('Survey')
  const stepTimer = useRef(0)

  const { scene, animations } = useGLTF(MODEL_URL)
  const { actions } = useAnimations(animations, modelRef)

  useEffect(() => {
    actions?.Survey?.reset().fadeIn(0.3).play()
  }, [actions])

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  const playAction = (name) => {
    if (currentAction.current === name || !actions?.[name]) return
    actions[currentAction.current]?.fadeOut(0.25)
    actions[name].reset().fadeIn(0.25).play()
    currentAction.current = name
  }

  useFrame((state, delta) => {
    const store = useGameStore.getState()
    if (!store.started) return

    const missionOpen = !!store.activeMission
    let { pathProgress: t, lateral } = store
    let moving = false

    if (!missionOpen) {
      const { forward, backward, left, right } = keys.current

      if (forward) {
        t = Math.min(1, t + CLIMB_SPEED * delta)
        moving = true
      } else if (backward) {
        t = Math.max(0, t - CLIMB_SPEED * delta)
        moving = true
      }
      if (left) {
        lateral = clampLateral(lateral - LATERAL_SPEED * delta)
        moving = true
      } else if (right) {
        lateral = clampLateral(lateral + LATERAL_SPEED * delta)
        moving = true
      }

      store.setProgress(t)
      store.setLateral(lateral)

      // checa se cruzou o limiar de alguma fase, subindo
      for (const phase of PHASES) {
        const justEntered =
          forward && t >= phase.t && !store.completedMissions.includes(phase.id)
        if (justEntered && store.activeMission !== phase.id) {
          const alreadyOpenedOnce = store._lastOpened === phase.id
          if (!alreadyOpenedOnce) {
            store.openMission(phase.id)
            store.showToast(phase.title, phase.color)
            useGameStore.setState({ _lastOpened: phase.id })
            playChime?.(220 + PHASES.indexOf(phase) * 40)
          }
        }
      }
    }

    playAction(moving ? 'Walk' : 'Survey')

    if (moving) {
      stepTimer.current += delta
      if (stepTimer.current >= STEP_INTERVAL) {
        stepTimer.current = 0
        playStep?.()
      }
    } else {
      stepTimer.current = STEP_INTERVAL // primeiro passo toca logo ao começar a andar de novo
    }

    const { position, yaw } = pointOnTreePath(t, lateral)

    let diff = yaw - currentYaw.current
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    currentYaw.current += diff * Math.min(1, delta * 8)

    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2])
      groupRef.current.rotation.y = currentYaw.current
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={modelRef} scale={MODEL_SCALE} rotation={[0, MODEL_FACING_OFFSET, 0]}>
        <primitive object={scene} />
      </group>
      <pointLight position={[0, 0.5, 0.1]} color="#e8a33d" intensity={1} distance={3} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
