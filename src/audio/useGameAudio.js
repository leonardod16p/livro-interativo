import { useCallback, useEffect, useRef } from 'react'

/**
 * Áudio do jogo.
 * - O "chime" de missão é sintetizado via Web Audio API, então funciona
 *   imediatamente, sem precisar de nenhum arquivo.
 * - A música ambiente é opcional: se você colocar um arquivo em
 *   public/sounds/ambiente.mp3 ele toca em loop baixinho. Se o arquivo
 *   não existir, falha em silêncio (não quebra o jogo).
 */
export function useGameAudio() {
  const ctxRef = useRef(null)
  const ambientRef = useRef(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      ctxRef.current = new AudioCtx()
    }
    return ctxRef.current
  }, [])

  // toca um acorde curto e suave — usado ao entrar em um mundo/missão
  const playChime = useCallback(
    (baseFreq = 440) => {
      try {
        const ctx = getCtx()
        if (ctx.state === 'suspended') ctx.resume()
        const now = ctx.currentTime
        const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]

        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.value = freq
          gain.gain.setValueAtTime(0, now)
          gain.gain.linearRampToValueAtTime(0.06, now + 0.05 + i * 0.05)
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4 + i * 0.05)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + i * 0.05)
          osc.stop(now + 1.5 + i * 0.05)
        })
      } catch (e) {
        // Web Audio pode falhar antes de uma interação do usuário — tudo bem, ignoramos.
      }
    },
    [getCtx]
  )

  const startAmbient = useCallback(() => {
    if (ambientRef.current) return
    const audio = new Audio(`${import.meta.env.BASE_URL}sounds/ambiente.mp3`)
    audio.loop = true
    audio.volume = 0.25
    audio.play().catch(() => {
      /* arquivo ausente ou autoplay bloqueado — sem problema no MVP */
    })
    ambientRef.current = audio
  }, [])

  useEffect(() => {
    return () => {
      ambientRef.current?.pause()
    }
  }, [])

  return { playChime, startAmbient }
}
