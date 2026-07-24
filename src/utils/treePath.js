import { svgTo3D } from './coords'

// Mesma geometria de tronco usada em Trunk.jsx e TrunkSlots.jsx no projeto
// original — repetida aqui para que a trilha da raposa fique sempre colada
// na casca real do tronco (em vez de um cilindro imaginário separado).
const RADIUS_BOTTOM = 40 / 45
const RADIUS_TOP = 22 / 45

const [, TRUNK_TOP_Y] = svgTo3D(1000, 100)
const [, TRUNK_BASE_Y] = svgTo3D(1000, 900) // = 0, nível do chão
export const TRUNK_HEIGHT = TRUNK_TOP_Y - TRUNK_BASE_Y

// A trilha cobre da base do tronco (t=0, onde as raízes emergem do chão)
// até um pouco abaixo do começo da copa (t=1) — a raposa sobe pelo tronco,
// não pelos galhos finos, então paramos a espiral pouco antes da copa густа.
const PATH_TOP_Y = TRUNK_HEIGHT * 0.97
const PATH_BASE_Y = 0.15 // fica logo acima do chão, nunca dentro da vitrine de raízes

export const TREE_PATH = {
  turns: 3.2, // quantas voltas a trilha dá ao redor do tronco
  surfaceGap: 0.22, // distância da casca até o centro dos pés da raposa
  pathWidth: 0.5, // deslocamento lateral permitido (agarrado à casca)
}

function trunkRadiusAt(y) {
  const t = Math.max(0, Math.min(1, y / TRUNK_HEIGHT))
  return RADIUS_BOTTOM + (RADIUS_TOP - RADIUS_BOTTOM) * t
}

/**
 * Dado um progresso t (0 = base do tronco / raízes, 1 = topo, perto da copa)
 * e um deslocamento lateral (agarrado à casca), retorna a posição 3D e o
 * ângulo de "para onde olhar" nesse ponto da espiral real do tronco.
 */
export function pointOnTreePath(t, lateral = 0) {
  const clampedT = Math.max(0, Math.min(1, t))
  const y = PATH_BASE_Y + (PATH_TOP_Y - PATH_BASE_Y) * clampedT
  const angle = clampedT * TREE_PATH.turns * Math.PI * 2
  const radius = trunkRadiusAt(y) + TREE_PATH.surfaceGap + lateral

  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius

  // derivada aproximada (direção de quem está subindo/andando)
  const k = TREE_PATH.turns * Math.PI * 2
  const dx = -Math.sin(angle) * radius * k
  const dz = Math.cos(angle) * radius * k
  const len = Math.hypot(dx, dz) || 1

  return {
    position: [x, y, z],
    dir: [dx / len, dz / len],
    angle,
    yaw: Math.atan2(dx / len, dz / len),
  }
}

export function clampLateral(l) {
  const half = TREE_PATH.pathWidth / 2
  return Math.min(half, Math.max(-half, l))
}
