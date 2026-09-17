let cached;

/**
 * Whether this device can comfortably run the live Three.js avatar.
 *
 * Returns false when WebGL is unavailable (old machines / locked-down
 * browsers), when the user prefers reduced motion, or when the browser
 * signals a metered/data-saver connection. In those cases the UI falls
 * back to the static clay artwork instead of a live (or broken) canvas.
 */
export function supports3D() {
  if (cached !== undefined) return cached;
  if (typeof window === "undefined") return false;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (reducedMotion || saveData) {
    cached = false;
    return cached;
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    cached = !!gl;
  } catch {
    cached = false;
  }
  return cached;
}
