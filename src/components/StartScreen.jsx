import { useGameStore } from '../state/useGameStore'
import { WORLDS } from '../data/worlds'

export function StartScreen({ onStart }) {
  const started = useGameStore((s) => s.started)
  const completedMissions = useGameStore((s) => s.completedMissions)
  const pathProgress = useGameStore((s) => s.pathProgress)
  const resetProgress = useGameStore((s) => s.resetProgress)

  if (started) return null

  const hasSave = completedMissions.length > 0 || pathProgress > 0.001

  const handleRestart = () => {
    resetProgress()
    onStart()
  }

  return (
    <div className="start-screen">
      <h1>Árvore do Conhecimento</h1>
      <p>
        Você vive dentro de uma árvore. Suba pela trilha em espiral para
        atravessar seus quatro mundos — Perguntas, Intuição, Física/Geometria
        e Abstração — completando uma missão em cada um.
      </p>
      <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
        Use <b>W A S D</b> ou as setas do teclado para se mover.
      </p>

      {hasSave && (
        <p className="save-info">
          Progresso salvo neste navegador: {completedMissions.length} de{' '}
          {WORLDS.length} mundos concluídos.
        </p>
      )}

      <div className="start-actions">
        <button className="btn btn-primary" style={{ '--accent': '#e8a33d' }} onClick={onStart}>
          {hasSave ? 'Continuar de onde parei' : 'Começar a subir'}
        </button>
        {hasSave && (
          <button className="btn btn-ghost" onClick={handleRestart}>
            Recomeçar do zero
          </button>
        )}
      </div>
    </div>
  )
}
