import { useEffect, useState } from 'react'
import { useGameStore } from '../state/useGameStore'
import { WORLDS } from '../data/worlds'

export function UIOverlay() {
  const pathProgress = useGameStore((s) => s.pathProgress)
  const toast = useGameStore((s) => s.toast)
  const clearToast = useGameStore((s) => s.clearToast)
  const resetProgress = useGameStore((s) => s.resetProgress)
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

  const currentWorld = [...WORLDS].reverse().find((w) => pathProgress >= w.t)

  return (
    <div className="hud">
      <div className="hud-top">
        <div>
          <div className="hud-title">
            Árvore do Conhecimento
            <small>{currentWorld ? currentWorld.title : 'A raiz'}</small>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pathProgress * 100}%` }} />
          </div>
        </div>

        <div className="controls-hint">
          <div><b>W</b> / <b>↑</b> — subir a árvore</div>
          <div><b>S</b> / <b>↓</b> — descer</div>
          <div><b>A D</b> / <b>← →</b> — andar de lado na trilha</div>
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
            if (window.confirm('Isso apaga seu progresso salvo (missões concluídas) e volta pra raiz da árvore. Continuar?')) {
              resetProgress()
            }
          }}
        >
          Reiniciar progresso
        </button>
      </div>
    </div>
  )
}
