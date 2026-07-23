export function LessonProgress({ total, current, color }) {
  return (
    <div className="lesson-dots">
      {[...Array(total)].map((_, i) => (
        <span
          key={i}
          className={`lesson-dot ${i === current ? 'lesson-dot-active' : ''} ${i < current ? 'lesson-dot-done' : ''}`}
          style={{ '--accent': color }}
        />
      ))}
    </div>
  )
}
