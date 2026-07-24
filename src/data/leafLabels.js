import treeData from './tree3d.json'
import { PHASES } from './phases'

// Achata todos os passos de todas as fases, na MESMA ordem em que
// useGameStore incrementa stepsCompleted — assim o rótulo #i sempre
// corresponde exatamente ao passo #i concluído pelo jogador.
const FLAT_STEPS = PHASES.flatMap((phase) =>
  phase.lesson.steps.map((step) => ({ phase, step }))
)

function shortLabelFor(step) {
  if (step.type === 'text') return step.title
  if (step.type === 'quiz') return step.prompt.length > 30 ? step.prompt.slice(0, 28) + '…' : step.prompt
  if (step.type === 'reflection') return step.prompt.length > 30 ? step.prompt.slice(0, 28) + '…' : step.prompt
  return 'Passo concluído'
}

// O projeto de raízes/tronco original tinha 20 posições de rótulo
// pré-desenhadas e bem distribuídas pela copa (treeData.leafTopics) —
// reaproveitamos essas posições (curadas à mão), só trocando o conteúdo.
const SLOTS = treeData.leafTopics

export const LEAF_LABELS = FLAT_STEPS.slice(0, SLOTS.length).map(({ phase, step }, i) => ({
  id: i,
  stepNumber: i + 1, // 1-indexado, bate com stepsCompleted da store
  label: shortLabelFor(step),
  tooltip: `${phase.title} · ${phase.lesson.title}`,
  color: phase.color,
  position: SLOTS[i].position,
}))
