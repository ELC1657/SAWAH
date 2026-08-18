/**
 * Shared timing. Nothing in this product animates for longer than 320ms,
 * and nothing that blocks a click animates for longer than 160ms.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const fast = { duration: 0.15, ease: EASE };
export const base = { duration: 0.22, ease: EASE };
export const slow = { duration: 0.32, ease: EASE };

export const riseIn = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Staggers a result list without making the last row feel late. */
export const listContainer = {
  animate: { transition: { staggerChildren: 0.025, delayChildren: 0.02 } },
};
