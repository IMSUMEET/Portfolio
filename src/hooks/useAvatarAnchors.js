import { useEffect, useState } from "react";

/** Shared stage box — capped at 640px so wide/tall screens don't rescale content. */
export const AVATAR_STAGE_HEIGHT = "min(640px, 85vh)";
export const AVATAR_STAGE_MAX_WIDTH = 560;

/**
 * Document Y of an element's border-box top (transform-aware via layout + scroll).
 * Prefer this over offsetTop chains, which break across transformed ancestors.
 */
function docTop(el) {
  if (!el) return null;
  return el.getBoundingClientRect().top + window.scrollY;
}

function docCenterY(el) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.top + window.scrollY + r.height / 2;
}

/**
 * Measure how far the avatar stage must translate so each section's anchor
 * lines up — replaces hard-coded `N * innerHeight` guesses that break when
 * section height ≠ 100vh or the stage is capped at 720px.
 *
 * Falls back to viewport multiples until the DOM (and desk image) is ready.
 */
export function useAvatarAnchors(enabled) {
  const [anchors, setAnchors] = useState(() => fallbackAnchors());

  useEffect(() => {
    if (!enabled) return undefined;

    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const stage = document.querySelector("[data-avatar-stage]");
        if (!stage) return;

        // Stage container itself is never translated — only the Canvas inside is.
        const stageY = docTop(stage);
        const stageMid = docCenterY(stage);
        if (stageY == null || stageMid == null) return;

        const expSeat =
          document.querySelector('[data-avatar-seat="experience"]') ||
          document.querySelector('[data-avatar-anchor="experience"]');
        const projects = document.querySelector('[data-avatar-anchor="projects"]');
        const aboutSeat =
          document.querySelector('[data-avatar-seat="about"]') ||
          document.querySelector('[data-avatar-anchor="about"]');
        const contact = document.querySelector('[data-avatar-anchor="contact"]');

        // Align stage mid to seat / column mid so hips land behind each desk.
        const expTarget = docCenterY(expSeat);
        const projTarget = docCenterY(projects);
        const aboutTarget = docCenterY(aboutSeat);
        const contactTarget = docCenterY(contact);

        const next = {
          experience:
            expTarget != null ? expTarget - stageMid : fallbackAnchors().experience,
          projects:
            projTarget != null ? projTarget - stageMid : fallbackAnchors().projects,
          about:
            aboutTarget != null ? aboutTarget - stageMid : fallbackAnchors().about,
          contact:
            contactTarget != null
              ? contactTarget - stageMid
              : fallbackAnchors().contact,
        };

        // Keep phases strictly ordered so lerp math never goes negative.
        next.projects = Math.max(next.projects, next.experience + 80);
        next.about = Math.max(next.about, next.projects + 80);
        next.contact = Math.max(next.contact, next.about + 80);

        setAnchors((prev) =>
          prev.experience === next.experience &&
          prev.projects === next.projects &&
          prev.about === next.about &&
          prev.contact === next.contact
            ? prev
            : next,
        );
      });
    };

    measure();

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    const stage = document.querySelector("[data-avatar-stage]");
    if (ro && stage) ro.observe(stage);
    document.querySelectorAll("[data-avatar-anchor], [data-avatar-seat]").forEach((el) => {
      ro?.observe(el);
    });

    window.addEventListener("resize", measure);
    // Desk / about art can shift layout after decode.
    window.addEventListener("load", measure);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, [enabled]);

  return anchors;
}

function fallbackAnchors() {
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  return {
    experience: vh * 1.05,
    projects: vh * 2,
    about: vh * 3,
    contact: vh * 4,
  };
}
