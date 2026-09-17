/**
 * Programmatic scroll to a section top.
 *
 * The page's avatar choreography is driven by scrollY, so we animate scrollY
 * ourselves. Default duration is deliberate so fall / stand / sit poses play
 * through on longer jumps; callers can pass a shorter `duration` for snappy
 * nearby CTAs (e.g. Hero → Experience).
 *
 * Important: html has `scroll-behavior: smooth`, so every frame must use
 * `behavior: "instant"` — otherwise the browser queues another ease on top of
 * ours and the motion feels late to start.
 */

let rafId = 0;

function scrollInstant(y) {
  window.scrollTo({ top: y, left: 0, behavior: "instant" });
}

export function smoothScrollTo(id, { duration, kickstart = false } = {}) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;

  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  const startY = window.scrollY;
  const targetY = startY + el.getBoundingClientRect().top;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;

  // Scale duration with distance so near and far jumps feel balanced.
  // Cap default so long jumps don't drag; allow overrides for CTAs.
  const ms =
    duration ?? Math.min(1800, Math.max(700, Math.abs(distance) * 0.4));

  // Jump past the avatar's standing hold (~22vh) so the fall starts on click
  // instead of after the scroll has already been moving for a beat.
  let fromY = startY;
  if (kickstart && distance > 0) {
    const kick = Math.min(distance, window.innerHeight * 0.24);
    fromY = startY + kick;
    scrollInstant(fromY);
  }

  const remaining = targetY - fromY;
  if (Math.abs(remaining) < 2) return;

  // easeOutCubic — responds immediately, then settles.
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  // Pretend one frame already elapsed so the first paint moves (no dead start).
  const startTime = performance.now() - 16;

  const step = (now) => {
    const p = Math.min(1, (now - startTime) / ms);
    scrollInstant(fromY + remaining * easeOutCubic(p));
    if (p < 1) rafId = requestAnimationFrame(step);
    else rafId = 0;
  };

  step(performance.now());
}
