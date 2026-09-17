import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "../../data/resume";
import SkillsMarquee from "../SkillsMarquee";
import {
  SiSpringboot,
  SiReact,
  SiTypescript,
  SiApachekafka,
  SiRedis,
  SiPostgresql,
  SiSocketdotio,
  SiDocker,
  SiOpencv,
} from "react-icons/si";
import { FaAws, FaCube, FaProjectDiagram } from "react-icons/fa";
import { HiOutlineCpuChip, HiOutlineSquare3Stack3D } from "react-icons/hi2";
import { VscAzure } from "react-icons/vsc";
import opMap from "../../assets/op-map.png";
import { AVATAR_STAGE_HEIGHT, AVATAR_STAGE_MAX_WIDTH } from "../../hooks/useAvatarAnchors";

/** Brand icons for project tech tags (orbital pills + shared lookups). */
const TECH_ICONS = {
  "Spring Boot": { Icon: SiSpringboot, color: "#6DB33F" },
  React: { Icon: SiReact, color: "#61DAFB" },
  TypeScript: { Icon: SiTypescript, color: "#3178C6" },
  Kafka: { Icon: SiApachekafka, color: "#231F20" },
  Redis: { Icon: SiRedis, color: "#FF4438" },
  PostgreSQL: { Icon: SiPostgresql, color: "#4169E1" },
  WebSockets: { Icon: SiSocketdotio, color: "#010101" },
  Neo4j: { Icon: FaProjectDiagram, color: "#008CC1" },
  "Redis Pub/Sub": { Icon: SiRedis, color: "#FF4438" },
  Algorithms: { Icon: HiOutlineCpuChip, color: "#6366f1" },
  "Canvas API": { Icon: HiOutlineSquare3Stack3D, color: "#3b82f6" },
  "AWS Lambda": { Icon: FaAws, color: "#FF9900" },
  S3: { Icon: FaAws, color: "#FF9900" },
  Docker: { Icon: SiDocker, color: "#2496ED" },
  ECR: { Icon: FaAws, color: "#FF9900" },
  OpenCV: { Icon: SiOpencv, color: "#5C3EE8" },
  "ResNet-34": { Icon: FaCube, color: "#111827" },
  Azure: { Icon: VscAzure, color: "#0078D4" },
};

function ChevronIcon({ dir = "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: dir === "left" ? "rotate(180deg)" : "none" }}
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

/** A slowly-rotating dashed orbit ring with a glowing dot riding along it. */
function OrbitRing({ inset, duration, reverse = false, dotColor }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        inset: `${inset}%`,
        border: "1.5px dashed rgba(124, 109, 242, 0.28)",
      }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <span
        className="absolute rounded-full"
        style={{
          top: -4,
          left: "50%",
          width: 8,
          height: 8,
          marginLeft: -4,
          background: dotColor,
          boxShadow: `0 0 10px ${dotColor}`,
        }}
      />
    </motion.div>
  );
}

/**
 * Per-project visual: the avatar (rendered separately, on top) stands at the
 * center while this paints an animated "orbital system" backdrop and floats the
 * project's tech stack as clay pills around it.
 */
function ProjectVisual({ project }) {
  const tech = project.tech;
  const n = tech.length;
  const rx = 47; // horizontal orbit radius (% of container)
  const ry = 43; // vertical orbit radius
  const startAngle = (-128 * Math.PI) / 180; // begin top-left, like the mockup

  const nodes = tech.map((t, i) => {
    const theta = startAngle + (i * 2 * Math.PI) / n;
    return {
      t,
      left: 50 + rx * Math.cos(theta),
      top: 50 + ry * Math.sin(theta),
    };
  });

  return (
    <div className="relative w-full max-w-lg aspect-square">
      {/* Soft aurora glow (replaces the flat purple circle) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 46%, rgba(150,130,255,0.55), rgba(150,130,255,0.14) 42%, transparent 68%)",
          filter: "blur(4px)",
        }}
      />

      {/* Animated orbital rings */}
      <OrbitRing inset={6} duration={46} dotColor="#7c6df2" />
      <OrbitRing inset={19} duration={34} reverse dotColor="#e88060" />
      <OrbitRing inset={32} duration={58} dotColor="#6090d8" />

      {/* Spokes + floating tech pills, swapped per project */}
      <AnimatePresence mode="wait">
        <motion.div
          key={project.name}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Faint spokes from center to each node */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <g stroke="rgba(124,109,242,0.35)" strokeWidth="0.4" strokeLinecap="round">
              {nodes.map((node) => (
                <line
                  key={node.t}
                  x1="50"
                  y1="50"
                  x2={node.left}
                  y2={node.top}
                />
              ))}
            </g>
          </svg>

          {nodes.map((node, i) => {
            const meta = TECH_ICONS[node.t];
            const Icon = meta?.Icon;
            return (
              <div
                key={node.t}
                className="absolute"
                style={{
                  left: `${node.left}%`,
                  top: `${node.top}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                  transition={{
                    opacity: { delay: i * 0.05, duration: 0.35 },
                    scale: { delay: i * 0.05, duration: 0.35 },
                    y: {
                      duration: 3.2 + (i % 3) * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <div className="group relative">
                    <div
                      className="clay-card flex items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110"
                      style={{ width: 52, height: 52 }}
                      title={node.t}
                    >
                      {Icon ? (
                        <Icon size={24} style={{ color: meta.color }} />
                      ) : (
                        <span
                          className="text-[10px] font-semibold px-1 text-center leading-tight"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {node.t}
                        </span>
                      )}
                    </div>
                    <span
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                      style={{
                        background: "var(--bg-surface)",
                        boxShadow: "var(--shadow-clay)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {node.t}
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function ProjectsSection({ sectionRef }) {
  const [active, setActive] = useState(0);
  const localRef = useRef(null);
  const total = projects.length;
  const project = projects[active];

  const go = (delta) => setActive((i) => (i + delta + total) % total);
  const goTo = (i) => setActive(i);

  // Keyboard ←/→ + swipe, only while this section fills the viewport
  useEffect(() => {
    const el = localRef.current;
    const inView = () => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return Math.abs(r.top) < window.innerHeight * 0.5;
    };
    const onKey = (e) => {
      if (!inView()) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };
    let startX = null;
    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };
    const onTouchEnd = (e) => {
      if (startX == null || !inView()) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      startX = null;
    };
    window.addEventListener("keydown", onKey, { capture: true });
    el?.addEventListener("touchstart", onTouchStart, { passive: true });
    el?.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey, { capture: true });
      el?.removeEventListener("touchstart", onTouchStart);
      el?.removeEventListener("touchend", onTouchEnd);
    };
  }, [active]);

  const setRefs = (node) => {
    localRef.current = node;
    if (typeof sectionRef === "function") sectionRef(node);
    else if (sectionRef) sectionRef.current = node;
  };

  return (
    <section
      ref={setRefs}
      id="projects"
      className="section-snap relative min-h-0 lg:min-h-screen flex items-start lg:items-center px-6 sm:px-8 md:px-16 lg:px-24 pt-16 lg:pt-0"
    >
      <div className="page-shell grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* ── Left column — carousel content ── */}
        <div className="relative min-w-0">
          <p className="clay-section-label">
            <img src={opMap} alt="" className="op-mark" draggable={false} />
            Featured Projects
          </p>

          {/* Grid-stack stage: every project occupies the same cell, so the
              stage auto-sizes to the tallest project at any width — the controls
              below never shift, and content never overflows. Only the active
              slide is visible (cross-fades on change). */}
          <div className="grid grid-cols-1 mb-2">
            {projects.map((p, i) => {
              const isActive = i === active;
              return (
                <motion.div
                  key={p.name}
                  style={{ gridArea: "1 / 1" }}
                  className={isActive ? "" : "pointer-events-none select-none"}
                  aria-hidden={!isActive}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2
                    className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-2 break-words"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {p.name}
                  </h2>
                  <p
                    className="text-sm font-semibold mb-5"
                    style={{ color: "var(--clay-purple)" }}
                  >
                    {p.tagline}
                  </p>
                  <p
                    className="text-base leading-7 max-w-xl mb-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {p.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {p.tech.map((t) => (
                      <span
                        key={t}
                        className="clay-pill px-3 py-1.5 text-[11px] rounded-full"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-6">
            <a
              href={project.live || project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="clay-button clay-button-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
            >
              View Project <ExternalLinkIcon />
            </a>
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="clay-button clay-button-secondary inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
            >
              <GitHubIcon /> GitHub
            </a>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center gap-5 mt-10">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => go(-1)}
                aria-label="Previous project"
                className="clay-button clay-button-secondary flex items-center justify-center w-11 h-11 rounded-full"
                style={{ color: "var(--text-secondary)" }}
              >
                <ChevronIcon dir="left" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next project"
                className="clay-button clay-button-secondary flex items-center justify-center w-11 h-11 rounded-full"
                style={{ color: "var(--text-secondary)" }}
              >
                <ChevronIcon dir="right" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2.5">
              {projects.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => goTo(i)}
                  aria-label={`Show ${p.name}`}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === active ? 28 : 9,
                    height: 9,
                    background:
                      i === active ? "var(--clay-purple)" : "var(--text-muted)",
                    opacity: i === active ? 1 : 0.4,
                  }}
                />
              ))}
            </div>

            <span
              className="text-xs font-semibold tabular-nums"
              style={{ color: "var(--text-muted)" }}
            >
              {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>

          {/* Hint */}
          <p
            className="text-[11px] tracking-wide mt-4 flex items-center gap-1.5"
            style={{ color: "var(--text-muted)", opacity: 0.75 }}
          >
            <span aria-hidden>←</span>
            Use the arrows to browse projects
            <span aria-hidden>→</span>
          </p>

          {/* Skills stream — left column only, keeps section one screen tall */}
          <div className="mt-8">
            <SkillsMarquee />
          </div>
        </div>

        {/* Orbital visual is desktop-only — it's designed to sit behind the avatar */}
        <div
          data-avatar-anchor="projects"
          className="hidden lg:flex items-center justify-center w-full"
          style={{ height: AVATAR_STAGE_HEIGHT, maxWidth: AVATAR_STAGE_MAX_WIDTH }}
        >
          <ProjectVisual project={project} />
        </div>
      </div>
    </section>
  );
}
