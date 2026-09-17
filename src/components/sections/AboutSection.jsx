import React from "react";
import { education } from "../../data/resume";
import opCompass from "../../assets/op-compass.png";
import opScroll from "../../assets/op-scroll.png";
import { AVATAR_STAGE_HEIGHT, AVATAR_STAGE_MAX_WIDTH } from "../../hooks/useAvatarAnchors";

function degreeShort(degree) {
  if (degree.startsWith("Master"))
    return degree.replace("Master of Science -", "M.S.");
  if (degree.startsWith("Bachelor"))
    return degree.replace("Bachelor of Engineering -", "B.E.");
  return degree;
}

export default function AboutSection({ sectionRef }) {
  return (
    <section
      ref={sectionRef}
      id="about"
      className="section-snap relative min-h-0 lg:min-h-screen flex items-start lg:items-center px-6 sm:px-8 md:px-16 lg:px-24 pt-16 lg:pt-0"
    >
      <div className="page-shell grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="clay-section-label">
            <img src={opCompass} alt="" className="op-mark" draggable={false} />
            About Me
          </p>

          <div
            className="text-base leading-7 max-w-md mb-12 space-y-4"
            style={{ color: "var(--text-secondary)" }}
          >
            <p>
              I love building things with software. There&apos;s something
              incredibly satisfying about taking a difficult problem, breaking
              it apart piece by piece, and eventually turning an idea into
              something real. I enjoy the entire process: the moments when
              everything clicks, the bugs that refuse to cooperate, and the
              constant challenge of figuring things out.
            </p>
            <p>
              Building, breaking, learning, and building again is what keeps me
              excited about development. And when I need a reset, I usually turn
              to chess or the gym.
            </p>
          </div>

          <p className="clay-section-label">
            <img
              src={opScroll}
              alt=""
              className="op-mark op-mark-scroll"
              draggable={false}
            />
            Education
          </p>

          <ul className="max-w-md space-y-6">
            {education.map((ed) => (
              <li key={ed.school}>
                <div className="flex items-baseline justify-between gap-4">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {degreeShort(ed.degree)}
                  </p>
                  <p
                    className="text-xs font-medium shrink-0 tabular-nums"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {ed.year}
                  </p>
                </div>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {ed.school}
                </p>
                {ed.focus && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {ed.focus}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Seat target for the glowing About desk (art lives on the hero stage) */}
        <div
          data-avatar-anchor="about"
          className="hidden lg:block relative w-full"
          style={{ height: AVATAR_STAGE_HEIGHT, maxWidth: AVATAR_STAGE_MAX_WIDTH }}
          aria-hidden
        >
          <span
            data-avatar-seat="about"
            className="absolute pointer-events-none"
            style={{
              left: "38%",
              top: "55%",
              width: 1,
              height: 1,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
