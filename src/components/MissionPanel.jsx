import { useGameStore } from '../state/useGameStore'
import { worldById } from '../data/worlds'
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
  const world = worldById(activeMission)
  if (!world) return null

  const steps = world.lesson.steps
  const step = steps[activeStep]
  const StepComponent = STEP_COMPONENTS[step.type]
  const isLastStep = activeStep === steps.length - 1

  return (
    <div className="mission-panel">
      <div className="mission-card" style={{ '--accent': world.color }}>
        <div className="mission-eyebrow" style={{ color: world.color }}>
          {world.title} · {world.lesson.title}
        </div>

        <LessonProgress total={steps.length} current={activeStep} color={world.color} />

        {/* key força o componente a "resetar" (limpar seleção etc) a cada passo */}
        <StepComponent
          key={`${activeMission}-${activeStep}`}
          step={step}
          color={world.color}
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
