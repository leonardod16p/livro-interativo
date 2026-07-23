export function LessonStepText({ step, color, onContinue }) {
  return (
    <>
      <h3 className="lesson-step-title">{step.title}</h3>
      <p className="mission-body">{step.body}</p>
      <div className="mission-actions">
        <button className="btn btn-primary" style={{ '--accent': color }} onClick={onContinue}>
          Continuar
        </button>
      </div>
    </>
  )
}
