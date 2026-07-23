import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useKeyboard } from '../hooks/useKeyboard'
import { pointOnSpiral, clampLateral } from '../utils/spiral'
import { useGameStore } from '../state/useGameStore'
import { WORLDS } from '../data/worlds'

const CLIMB_SPEED = 0.05     // progresso (0..1) por segundo, subindo/descendo
const LATERAL_SPEED = 2.4    // unidades por segundo, andando de lado na trilha

// respeita o base path configurado no vite.config.js (funciona local e no GitHub Pages)
const MODEL_URL = `${import.meta.env.BASE_URL}models/fox.glb`

// O modelo original é bem maior que o mundo do jogo — este fator o encolhe
// para a altura ficar compatível com a trilha (~1 unidade de altura).
const MODEL_SCALE = 0.012

// Se o personagem parecer andar "de costas" (olhando pra trás do
// movimento), troque este valor para 0 — depende de como o modelo
// escolhido foi exportado.
const MODEL_FACING_OFFSET = Math.PI

export function Character({ playChime }) {
  const groupRef = useRef()
  const modelRef = useRef()
  const keys = useKeyboard()
  const currentYaw = useRef(0)
  const currentAction = useRef('Survey')

  const { scene, animations } = useGLTF(MODEL_URL)
  const { actions } = useAnimations(animations, modelRef)

  // liga a animação "parado" assim que o modelo carrega
  useEffect(() => {
    actions?.Survey?.reset().fadeIn(0.3).play()
  }, [actions])

  // o modelo importado não vem com sombra ligada por padrão
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  // faz a transição suave entre as animações disponíveis (Survey / Walk)
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

      // checa se cruzou o limiar de algum mundo
      for (const world of WORLDS) {
        const justEntered =
          forward && t >= world.t && !store.completedMissions.includes(world.id)
        if (justEntered && store.activeMission !== world.id) {
          const alreadyOpenedOnce = store._lastOpened === world.id
          if (!alreadyOpenedOnce) {
            store.openMission(world.id)
            store.showToast(world.title, world.color)
            useGameStore.setState({ _lastOpened: world.id })
            playChime?.(220 + WORLDS.indexOf(world) * 60)
          }
        }
      }
    }

    playAction(moving ? 'Walk' : 'Survey')

    const { position, yaw } = pointOnSpiral(t, lateral)

    // suaviza a rotação (menor caminho angular)
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
      {/* pequeno brilho mágico que acompanha o personagem — combina com a árvore */}
      <pointLight position={[0, 0.85, 0.2]} color="#e8a33d" intensity={1} distance={4} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
