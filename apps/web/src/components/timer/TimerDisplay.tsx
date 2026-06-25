interface TimerDisplayProps {
  formattedTime: string;
  label?: string;
}

export function TimerDisplay({ formattedTime, label }: TimerDisplayProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${formattedTime} ${label ?? ''}`}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text)',
          letterSpacing: '-0.02em',
          lineHeight: 'var(--line-height-tight)',
        }}
      >
        {formattedTime}
      </div>
      {label && (
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-2)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
