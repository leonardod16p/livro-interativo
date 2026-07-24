import { useCallback, useEffect, useRef } from 'react'

/**
 * Áudio do jogo.
 * - O "chime" de missão e o som de passo são sintetizados via Web Audio
 *   API, então funcionam imediatamente, sem precisar de nenhum arquivo.
 * - O vento também é 100% sintetizado (ruído branco filtrado, com um LFO
 *   fazendo a intensidade variar em rajadas) — sem depender de arquivo.
 * - A música ambiente de fundo é opcional: se você colocar um arquivo em
 *   public/sounds/ambiente.mp3 ele toca baixinho por cima do vento. Se o
 *   arquivo não existir, falha em silêncio (não quebra o jogo).
 */
export function useGameAudio() {
  const ctxRef = useRef(null)
  const ambientRef = useRef(null)
  const windRef = useRef(null)
  const lastStepAt = useRef(0)

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

  // buffer de ruído branco de 2s, reaproveitado tanto pro vento quanto pros passos
  const getNoiseBuffer = useCallback(() => {
    const ctx = getCtx()
    if (!ctx._noiseBuffer) {
      const length = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
      ctx._noiseBuffer = buffer
    }
    return ctx._noiseBuffer
  }, [getCtx])

  // vento contínuo: ruído filtrado (passa-baixa) com um LFO fazendo a
  // frequência de corte variar devagar, imitando rajadas de vento
  const startWind = useCallback(() => {
    try {
      if (windRef.current) return
      const ctx = getCtx()
      if (ctx.state === 'suspended') ctx.resume()

      const source = ctx.createBufferSource()
      source.buffer = getNoiseBuffer()
      source.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 500
      filter.Q.value = 0.7

      const gain = ctx.createGain()
      gain.gain.value = 0.05

      // LFO lento modulando o filtro -> sensação de rajada
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.07
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 260
      lfo.connect(lfoGain)
      lfoGain.connect(filter.frequency)
      lfo.start()

      source.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      source.start()

      windRef.current = { source, filter, gain, lfo }
    } catch (e) {
      // ignora — Web Audio pode falhar antes de interação do usuário
    }
  }, [getCtx, getNoiseBuffer])

  const stopWind = useCallback(() => {
    const w = windRef.current
    if (!w) return
    try {
      w.source.stop()
      w.lfo.stop()
    } catch (e) {
      /* já parado */
    }
    windRef.current = null
  }, [])

  // som curto e abafado de passo — usado enquanto a raposa anda
  const playStep = useCallback(() => {
    try {
      const ctx = getCtx()
      const now = ctx.currentTime
      if (now - lastStepAt.current < 0.18) return // evita disparos demais no mesmo frame
      lastStepAt.current = now

      const source = ctx.createBufferSource()
      source.buffer = getNoiseBuffer()
      source.playbackRate.value = 0.8 + Math.random() * 0.4

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 260 + Math.random() * 120
      filter.Q.value = 1.2

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(0.09, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

      source.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      source.start(now)
      source.stop(now + 0.1)
    } catch (e) {
      // ignora
    }
  }, [getCtx, getNoiseBuffer])

  const startAmbient = useCallback(() => {
    startWind()

    if (ambientRef.current) return
    const audio = new Audio(`${import.meta.env.BASE_URL}sounds/ambiente.mp3`)
    audio.loop = true
    audio.volume = 0.2
    audio.play().catch(() => {
      /* arquivo ausente ou autoplay bloqueado — sem problema, o vento já toca */
    })
    ambientRef.current = audio
  }, [startWind])

  useEffect(() => {
    return () => {
      ambientRef.current?.pause()
      stopWind()
    }
  }, [stopWind])

  return { playChime, startAmbient, playStep }
}
