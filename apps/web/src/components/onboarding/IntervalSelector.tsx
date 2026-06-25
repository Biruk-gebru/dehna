'use client';

interface IntervalSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
}

export function IntervalSelector({ value, onChange }: IntervalSelectorProps) {
  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text)',
          marginBottom: 'var(--space-5)',
        }}
      >
        {value} min
      </div>
      <input
        type="range"
        className="range-input"
        min={15}
        max={60}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Work interval in minutes"
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 'var(--space-2)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
        }}
      >
        <span>15 min</span>
        <span>60 min</span>
      </div>
    </div>
  );
}
