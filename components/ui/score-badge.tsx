/**
 * Canonical ScoreBadge component — colour-coded score display.
 *
 * Usage:
 *   <ScoreBadge score={75} />           → "75"   (total score, no max shown)
 *   <ScoreBadge score={14} max={20} />  → "14/20" (per-scenario score)
 */
export function ScoreBadge({ score, max }: { score: number; max?: number }) {
  const percentage = max !== undefined ? (score / max) * 100 : score;

  let colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  if (percentage >= 80) {
    colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  } else if (percentage >= 60) {
    colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  } else if (percentage >= 40) {
    colorClass = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  }

  return (
    <span className={`px-2 py-1 rounded-md text-sm font-medium ${colorClass}`}>
      {max !== undefined ? `${score}/${max}` : score}
    </span>
  );
}
