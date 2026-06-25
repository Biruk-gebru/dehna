import { Button } from '@/components/ui/Button';
import type { TimerState } from '@/hooks/useTimer';

interface TimerControlsProps {
  mode: 'idle' | 'running' | 'paused';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function TimerControls({ mode, onStart, onPause, onResume, onStop }: TimerControlsProps) {
  if (mode === 'idle') {
    return (
      <Button onClick={onStart} style={{ minWidth: 160 }} aria-label="Start work session">
        Start working
      </Button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
      {mode === 'running' ? (
        <Button variant="outline" onClick={onPause} style={{ minWidth: 100 }} aria-label="Pause timer">
          Pause
        </Button>
      ) : (
        <Button variant="primary" onClick={onResume} style={{ minWidth: 100 }} aria-label="Resume timer">
          Resume
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={onStop} aria-label="Stop and end work session">
        Stop
      </Button>
    </div>
  );
}
