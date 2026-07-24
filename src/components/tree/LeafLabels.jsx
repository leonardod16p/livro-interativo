import { Html } from '@react-three/drei'
import { LEAF_LABELS } from '../../data/leafLabels'
import { useGameStore } from '../../state/useGameStore'

export function LeafLabels() {
  const stepsCompleted = useGameStore((s) => s.stepsCompleted)

  return (
    <group>
      {LEAF_LABELS.map((item) => {
        const visible = item.stepNumber <= stepsCompleted
        if (!visible) return null
        return (
          <Html key={item.id} position={item.position} center distanceFactor={9} occlude={false}>
            <div className="leaf-label" style={{ '--accent': item.color }} title={item.tooltip}>
              {item.label}
            </div>
          </Html>
        )
      })}
    </group>
  )
}
