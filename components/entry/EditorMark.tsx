/**
 * Marks an entry a moderator has personally checked, as distinct from one the
 * vote threshold promoted on its own.
 *
 * Filled seal vermilion, the only accent outside the dialect palette. Green or
 * teal would have read as Meno-Mene or Ngeto-Ngete, so the mark separates from
 * the dialect earth tones by chroma rather than by hue.
 */
export function EditorMark({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      role="img"
      aria-label="Checked by an editor"
    >
      <title>Checked by an editor</title>
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path
        d="M4.6 8.2L6.9 10.5L11.5 5.5"
        stroke="var(--color-paper)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
