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
      <Button onClick={onStart} style={{ minWidth: 160 }}>
        Start working
      </Button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
      {mode === 'running' ? (
        <Button variant="outline" onClick={onPause} style={{ minWidth: 100 }}>
          Pause
        </Button>
      ) : (
        <Button variant="primary" onClick={onResume} style={{ minWidth: 100 }}>
          Resume
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={onStop}>
        Stop
      </Button>
    </div>
  );
}
