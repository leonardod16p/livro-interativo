import { useEffect, useState } from 'react'
import { useGameStore } from '../state/useGameStore'
import { PHASES } from '../data/phases'

export function UIOverlay() {
  const pathProgress = useGameStore((s) => s.pathProgress)
  const completedMissions = useGameStore((s) => s.completedMissions)
  const toast = useGameStore((s) => s.toast)
  const clearToast = useGameStore((s) => s.clearToast)
  const resetProgress = useGameStore((s) => s.resetProgress)
  const zoomIn = useGameStore((s) => s.zoomIn)
  const zoomOut = useGameStore((s) => s.zoomOut)
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    if (!toast) return
    setToastVisible(true)
    const hide = setTimeout(() => setToastVisible(false), 2600)
    const clear = setTimeout(() => clearToast(), 3000)
    return () => {
      clearTimeout(hide)
      clearTimeout(clear)
    }
  }, [toast, clearToast])

  const currentPhase = [...PHASES].reverse().find((p) => pathProgress >= p.t)

  return (
    <div className="hud">
      <div className="hud-top">
        <div>
          <div className="hud-title">
            Árvore do Conhecimento
            <small>{currentPhase ? currentPhase.title : 'A base do tronco'}</small>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pathProgress * 100}%` }} />
          </div>
          <div className="phase-count">
            {completedMissions.length} de {PHASES.length} fases concluídas
          </div>
        </div>

        <div className="controls-hint">
          <div><b>W</b> / <b>↑</b> — subir o tronco</div>
          <div><b>S</b> / <b>↓</b> — descer</div>
          <div><b>A D</b> / <b>← →</b> — andar ao redor da casca</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          className={`world-toast ${toastVisible ? 'visible' : ''}`}
          style={{ '--accent': toast?.color, color: toast?.color }}
        >
          {toast?.text}
        </div>
      </div>

      <div className="hud-bottom">
        <button
          className="reset-link"
          style={{ pointerEvents: 'all' }}
          onClick={() => {
            if (window.confirm('Isso apaga seu progresso salvo (fases concluídas e folhas reveladas) e volta pra base da árvore. Continuar?')) {
              resetProgress()
            }
          }}
        >
          Reiniciar progresso
        </button>

        <div className="zoom-controls" style={{ pointerEvents: 'all' }}>
          <button className="zoom-btn" onClick={zoomIn} aria-label="Aproximar">
            +
          </button>
          <button className="zoom-btn" onClick={zoomOut} aria-label="Afastar">
            −
          </button>
        </div>
      </div>
    </div>
  )
}
