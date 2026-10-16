import { Button } from '@/components/ui/Button';
import type { PostureSuggestion } from '@/lib/posture';

interface PostureSuggestionCardProps {
  suggestion: PostureSuggestion;
  onAccept: () => void;
  onDismiss: () => void;
}

export function PostureSuggestionCard({ suggestion, onAccept, onDismiss }: PostureSuggestionCardProps) {
  return (
    <div
      role="status"
      style={{
        maxWidth: 340,
        padding: 'var(--space-4) var(--space-5)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', lineHeight: 'var(--line-height-normal)' }}>
        {suggestion.message}
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button size="sm" onClick={onAccept}>
          {suggestion.to === 'standing' ? "I'm standing" : "I'm sitting"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Not now
        </Button>
      </div>
    </div>
  );
}
