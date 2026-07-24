import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import treeData from '../data/tree3d.json'
import { PHASES, phaseById } from '../data/phases'

const SAVE_KEY = 'arvore-do-conhecimento-save-v3'

const TOTAL_PHASES = PHASES.length // 7 (3 raízes + 4 tronco)
// total de PASSOS individuais de lição em todo o jogo (cada texto/quiz/
// reflexão conta um) — é essa granularidade que faz a copa crescer aos
// poucos, tarefa por tarefa, em vez de só em 7 saltos grandes.
const TOTAL_STEPS = PHASES.reduce((acc, p) => acc + p.lesson.steps.length, 0)

const ALL_LEAF_IDS = treeData.leaves.map((l) => l.id)
const ITEMS_PER_STEP = Math.ceil(ALL_LEAF_IDS.length / TOTAL_STEPS)
const EXTRA_FILL_PER_STEP = 4 // preenchimento de volume, bem menor por ser chamado mais vezes agora

const MIN_ZOOM = 1.8
const MAX_ZOOM = 9
const DEFAULT_ZOOM = 4.2
const ZOOM_STEP = 0.7

// Revela o próximo "lote" de folhas com base em quantos PASSOS de lição já
// foram concluídos (não fases) — assim a árvore ganha folhas novas a cada
// pergunta respondida, texto lido, reflexão escrita etc.
function nextLeafChunk(stepsCompleted, alreadyRevealed) {
  const start = (stepsCompleted - 1) * ITEMS_PER_STEP
  const end = start + ITEMS_PER_STEP
  const toReveal = ALL_LEAF_IDS.slice(start, end)

  const revealed = new Set(alreadyRevealed)
  toReveal.forEach((id) => revealed.add(id))

  const remaining = ALL_LEAF_IDS.filter((id) => !revealed.has(id))
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[remaining[i], remaining[j]] = [remaining[j], remaining[i]]
  }
  remaining.slice(0, EXTRA_FILL_PER_STEP).forEach((id) => revealed.add(id))

  return Array.from(revealed)
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      started: false,

      // progresso ao longo da trilha real (0 = base do tronco, 1 = topo)
      pathProgress: 0,
      lateral: 0,

      activeMission: null, // id da fase com o painel de lição aberto
      activeStep: 0, // índice do passo atual dentro da lição dessa fase
      completedMissions: [], // ids das fases já concluídas
      toast: null, // { text, color } — aviso rápido ao entrar numa fase

      stepsCompleted: 0, // contador global de passos de lição já concluídos
      revealedLeafIds: [], // folhas já reveladas na copa (cresce a cada passo)

      cameraDistance: DEFAULT_ZOOM, // controlado pelos botões de zoom, não pela roda do mouse

      start() {
        set({ started: true })
      },

      // usado pelo personagem a cada frame (fora do ciclo de render do React)
      setProgress(t) {
        set({ pathProgress: t })
      },
      setLateral(l) {
        set({ lateral: l })
      },

      zoomIn() {
        set((s) => ({ cameraDistance: Math.max(MIN_ZOOM, s.cameraDistance - ZOOM_STEP) }))
      },
      zoomOut() {
        set((s) => ({ cameraDistance: Math.min(MAX_ZOOM, s.cameraDistance + ZOOM_STEP) }))
      },

      showToast(text, color) {
        set({ toast: { text, color, key: Date.now() } })
      },
      clearToast() {
        set({ toast: null })
      },

      openMission(id) {
        if (get().completedMissions.includes(id)) return
        set({ activeMission: id, activeStep: 0 })
      },
      closeMission() {
        set({ activeMission: null })
      },

      // avança um passo dentro da lição atual — TODA vez que um passo é
      // concluído (texto lido, quiz respondido, reflexão escrita), a copa
      // ganha um novo lote de folhas. Se era o último passo, conclui a fase.
      advanceStep() {
        const { activeMission, activeStep, completedMissions, revealedLeafIds, stepsCompleted } = get()
        if (!activeMission) return
        const phase = phaseById(activeMission)
        const isLast = activeStep >= phase.lesson.steps.length - 1

        const nextStepsCompleted = stepsCompleted + 1
        const leaves = nextLeafChunk(nextStepsCompleted, revealedLeafIds)

        if (isLast) {
          const next = completedMissions.includes(activeMission)
            ? completedMissions
            : [...completedMissions, activeMission]

          set({
            completedMissions: next,
            activeMission: null,
            activeStep: 0,
            stepsCompleted: nextStepsCompleted,
            revealedLeafIds: leaves,
          })
        } else {
          set({
            activeStep: activeStep + 1,
            stepsCompleted: nextStepsCompleted,
            revealedLeafIds: leaves,
          })
        }
      },

      // apaga o progresso salvo e volta o personagem pra base da árvore
      resetProgress() {
        set({
          pathProgress: 0,
          lateral: 0,
          completedMissions: [],
          activeMission: null,
          activeStep: 0,
          toast: null,
          stepsCompleted: 0,
          revealedLeafIds: [],
          cameraDistance: DEFAULT_ZOOM,
          _lastOpened: null,
        })
      },

      progressPercent() {
        const { completedMissions } = get()
        return Math.round((completedMissions.length / TOTAL_PHASES) * 100)
      },
    }),
    {
      name: SAVE_KEY,
      partialize: (state) => ({
        pathProgress: state.pathProgress,
        lateral: state.lateral,
        completedMissions: state.completedMissions,
        stepsCompleted: state.stepsCompleted,
        revealedLeafIds: state.revealedLeafIds,
      }),
    }
  )
)

export { TOTAL_PHASES, TOTAL_STEPS }
