// Parâmetros geométricos da árvore-mundo.
// Tudo (personagem, trilha visual, plataformas dos mundos, câmera)
// deriva desta mesma função, então nunca saem de sincronia.
export const TREE = {
  trunkRadius: 2.2,      // raio do tronco
  pathRadius: 4.0,       // raio da trilha (distância do centro do tronco)
  turns: 4.5,            // quantas voltas a trilha dá ao redor do tronco
  totalHeight: 40,       // altura total a ser escalada
  pathWidth: 1.6,        // largura utilizável da trilha (deslocamento lateral)
}

/**
 * Dado um progresso t (0 = raiz, 1 = topo) e um deslocamento lateral,
 * retorna a posição 3D e a direção de "subida" nesse ponto da espiral.
 */
export function pointOnSpiral(t, lateral = 0) {
  const angle = t * TREE.turns * Math.PI * 2
  const radius = TREE.pathRadius + lateral

  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  const y = t * TREE.totalHeight

  // derivada em relação a t (direção de quem está subindo)
  const k = TREE.turns * Math.PI * 2
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
  const half = TREE.pathWidth / 2
  return Math.min(half, Math.max(-half, l))
}
