import { useState } from 'react'

export function LessonStepReflection({ step, color, onContinue }) {
  const [text, setText] = useState('')

  return (
    <>
      <p className="mission-body" style={{ marginBottom: 12 }}>{step.prompt}</p>
      <textarea
        className="reflection-input"
        placeholder={step.placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
      />
      <p className="reflection-note">
        Isso não é avaliado — é só um espaço pra organizar o pensamento.
      </p>
      <div className="mission-actions">
        <button className="btn btn-primary" style={{ '--accent': color }} onClick={onContinue}>
          Continuar
        </button>
      </div>
    </>
  )
}
