import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WORLDS, worldById } from '../data/worlds'

const SAVE_KEY = 'arvore-do-conhecimento-save'

export const useGameStore = create(
  persist(
    (set, get) => ({
      started: false,
      // progresso ao longo da espiral (0 = raiz da árvore, 1 = topo)
      pathProgress: 0,
      lateral: 0,

      activeMission: null,   // id do mundo com o painel de missão aberto
      activeStep: 0,          // índice do passo atual dentro da lição desse mundo
      completedMissions: [], // ids já concluídos
      toast: null,           // { text, color } — aviso rápido ao entrar num mundo

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

      // avança um passo dentro da lição atual; se era o último, conclui a missão
      advanceStep() {
        const { activeMission, activeStep, completedMissions } = get()
        if (!activeMission) return
        const world = worldById(activeMission)
        const isLast = activeStep >= world.lesson.steps.length - 1

        if (isLast) {
          const next = completedMissions.includes(activeMission)
            ? completedMissions
            : [...completedMissions, activeMission]
          set({ completedMissions: next, activeMission: null, activeStep: 0 })
        } else {
          set({ activeStep: activeStep + 1 })
        }
      },

      // apaga o progresso salvo e volta o personagem pra raiz da árvore
      resetProgress() {
        set({
          pathProgress: 0,
          lateral: 0,
          completedMissions: [],
          activeMission: null,
          activeStep: 0,
          toast: null,
          _lastOpened: null,
        })
      },

      progressPercent() {
        const { completedMissions } = get()
        return Math.round((completedMissions.length / WORLDS.length) * 100)
      },
    }),
    {
      name: SAVE_KEY,
      // só salva o que realmente representa "progresso" — não salva coisas
      // de UI momentâneas como o painel de missão aberto ou o toast
      partialize: (state) => ({
        pathProgress: state.pathProgress,
        lateral: state.lateral,
        completedMissions: state.completedMissions,
      }),
    }
  )
)
