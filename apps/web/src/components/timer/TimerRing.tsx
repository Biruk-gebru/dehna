interface TimerRingProps {
  progress: number;   // 0–1
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function TimerRing({ progress, size = 240, strokeWidth = 10, children }: TimerRingProps) {
  const half = size / 2;
  const r = half - strokeWidth;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={half}
          cy={half}
          r={r}
          fill="none"
          stroke="var(--color-timer-bg)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={half}
          cy={half}
          r={r}
          fill="none"
          stroke="var(--color-timer-ring)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${half} ${half})`}
          style={{ transition: 'stroke-dashoffset 0.8s linear' }}
        />
      </svg>
      {children && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
