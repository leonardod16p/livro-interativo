import { useState } from 'react'

export function LessonStepQuiz({ step, color, onContinue }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const isCorrect = selected === step.correctIndex

  const handlePick = (i) => {
    if (revealed) return
    setSelected(i)
    setRevealed(true)
  }

  return (
    <>
      <p className="mission-body" style={{ marginBottom: 16 }}>{step.prompt}</p>

      <div className="quiz-options">
        {step.options.map((opt, i) => {
          let state = 'idle'
          if (revealed) {
            if (i === step.correctIndex) state = 'correct'
            else if (i === selected) state = 'wrong'
          }
          return (
            <button
              key={i}
              className={`quiz-option quiz-option-${state}`}
              onClick={() => handlePick(i)}
              disabled={revealed}
              style={{ '--accent': color }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className={`quiz-feedback ${isCorrect ? 'quiz-feedback-correct' : 'quiz-feedback-wrong'}`}>
          <b>{isCorrect ? 'Boa!' : 'Quase.'}</b> {step.explanation}
        </div>
      )}

      <div className="mission-actions">
        <button
          className="btn btn-primary"
          style={{ '--accent': color, opacity: revealed ? 1 : 0.4 }}
          disabled={!revealed}
          onClick={onContinue}
        >
          Continuar
        </button>
      </div>
    </>
  )
}
