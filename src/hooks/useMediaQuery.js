import { useEffect, useState } from "react";

/**
 * Subscribe to a CSS media query and re-render on changes.
 * SSR-safe: falls back to `false` when `window` is unavailable.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Tailwind `lg` breakpoint — desktop and up. */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
