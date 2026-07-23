import { useEffect, useRef } from 'react'

const KEYS = {
  forward: ['KeyW', 'ArrowUp'],
  backward: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
}

/**
 * Retorna uma ref mutável { forward, backward, left, right }.
 * Usar uma ref (em vez de state) evita re-renderizar o React
 * a cada tecla — quem lê isso é o loop de animação (useFrame).
 */
export function useKeyboard() {
  const state = useRef({ forward: false, backward: false, left: false, right: false })

  useEffect(() => {
    const setKey = (code, value) => {
      for (const dir in KEYS) {
        if (KEYS[dir].includes(code)) state.current[dir] = value
      }
    }
    const onDown = (e) => setKey(e.code, true)
    const onUp = (e) => setKey(e.code, false)

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  return state
}
