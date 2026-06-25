import type { Exercise } from '@/types';

interface ExerciseCardProps {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
      }}
    >
      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {exercise.steps.map((step, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              fontSize: 'var(--font-size-base)',
              lineHeight: 'var(--line-height-relaxed)',
              color: 'var(--color-text)',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-primary)',
                width: 20,
              }}
            >
              {i + 1}.
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {exercise.tips.length > 0 && (
        <p
          style={{
            marginTop: 'var(--space-4)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--line-height-relaxed)',
            borderTop: '1px solid var(--color-border)',
            paddingTop: 'var(--space-3)',
          }}
        >
          {exercise.tips[0]}
        </p>
      )}
    </div>
  );
}
