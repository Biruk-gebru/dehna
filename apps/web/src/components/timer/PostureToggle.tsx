import type { Posture } from '@/types';

interface PostureToggleProps {
  posture: Posture;
  onChange: (posture: Posture) => void;
}

export function PostureToggle({ posture, onChange }: PostureToggleProps) {
  return (
    <div className="segmented" role="group" aria-label="Working posture">
      {(['sitting', 'standing'] as const).map((p) => (
        <button key={p} type="button" aria-pressed={posture === p} onClick={() => onChange(p)}>
          {p === 'sitting' ? 'Sitting' : 'Standing'}
        </button>
      ))}
    </div>
  );
}
