import { useGameStore } from '../state/useGameStore'
import { phaseById } from '../data/phases'
import { LessonStepText } from './lesson/LessonStepText'
import { LessonStepQuiz } from './lesson/LessonStepQuiz'
import { LessonStepReflection } from './lesson/LessonStepReflection'
import { LessonProgress } from './lesson/LessonProgress'

const STEP_COMPONENTS = {
  text: LessonStepText,
  quiz: LessonStepQuiz,
  reflection: LessonStepReflection,
}

export function MissionPanel() {
  const activeMission = useGameStore((s) => s.activeMission)
  const activeStep = useGameStore((s) => s.activeStep)
  const advanceStep = useGameStore((s) => s.advanceStep)
  const closeMission = useGameStore((s) => s.closeMission)

  if (!activeMission) return null
  const phase = phaseById(activeMission)
  if (!phase) return null

  const steps = phase.lesson.steps
  const step = steps[activeStep]
  const StepComponent = STEP_COMPONENTS[step.type]
  const isLastStep = activeStep === steps.length - 1

  return (
    <div className="mission-panel">
      <div className="mission-card" style={{ '--accent': phase.color }}>
        <div className="mission-eyebrow" style={{ color: phase.color }}>
          {phase.title} · {phase.lesson.title}
        </div>

        <LessonProgress total={steps.length} current={activeStep} color={phase.color} />

        {/* key força o componente a "resetar" (limpar seleção etc) a cada passo */}
        <StepComponent
          key={`${activeMission}-${activeStep}`}
          step={step}
          color={phase.color}
          onContinue={advanceStep}
        />

        {!isLastStep && (
          <button className="btn btn-ghost mission-skip" onClick={closeMission}>
            Ver depois
          </button>
        )}
      </div>
    </div>
  )
}
