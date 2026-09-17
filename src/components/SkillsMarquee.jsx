import React from "react";
import {
  SiSpringboot,
  SiDotnet,
  SiNodedotjs,
  SiApachekafka,
  SiDocker,
  SiKubernetes,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiThreedotjs,
  SiGit,
  SiPython,
} from "react-icons/si";
import { FaJava, FaAws } from "react-icons/fa";
import { VscAzure } from "react-icons/vsc";

/** Curated spotlight — enough to signal breadth, not a dump of every tool. */
const SKILLS = [
  { name: "Java", Icon: FaJava, color: "#E76F00" },
  { name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
  { name: "Python", Icon: SiPython, color: "#3776AB" },
  { name: "Spring Boot", Icon: SiSpringboot, color: "#6DB33F" },
  { name: ".NET", Icon: SiDotnet, color: "#512BD4" },
  { name: "Node.js", Icon: SiNodedotjs, color: "#5FA04E" },
  { name: "React", Icon: SiReact, color: "#61DAFB" },
  { name: "Tailwind", Icon: SiTailwindcss, color: "#06B6D4" },
  { name: "Three.js", Icon: SiThreedotjs, color: "#111827" },
  { name: "Kafka", Icon: SiApachekafka, color: "#231F20" },
  { name: "AWS", Icon: FaAws, color: "#FF9900" },
  { name: "Azure", Icon: VscAzure, color: "#0078D4" },
  { name: "Docker", Icon: SiDocker, color: "#2496ED" },
  { name: "Kubernetes", Icon: SiKubernetes, color: "#326CE5" },
  { name: "PostgreSQL", Icon: SiPostgresql, color: "#4169E1" },
  { name: "MongoDB", Icon: SiMongodb, color: "#47A248" },
  { name: "Redis", Icon: SiRedis, color: "#FF4438" },
  { name: "Git", Icon: SiGit, color: "#F05032" },
];

function SkillTile({ skill }) {
  const Icon = skill.Icon;
  return (
    <div className="group relative shrink-0">
      <div
        className="flex items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110"
        style={{
          width: 48,
          height: 48,
          background: "var(--bg-surface)",
          border: "1px solid rgba(99,102,241,0.08)",
        }}
      >
        <Icon size={22} style={{ color: skill.color }} />
      </div>
      <span
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        style={{
          background: "var(--bg-surface)",
          boxShadow: "var(--shadow-clay)",
          color: "var(--text-secondary)",
        }}
      >
        {skill.name}
      </span>
    </div>
  );
}

/**
 * Compact stack marquee for the Experience left column.
 * One CSS animation; icon-only (name on hover).
 */
export default function SkillsMarquee({ className = "" }) {
  const loop = [...SKILLS, ...SKILLS];

  return (
    <div className={className} aria-label="Technology stack">
      <p
        className="text-[10px] font-semibold tracking-[0.28em] uppercase mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        Stack
      </p>
      <div
        className="marquee-row py-1"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
          maskImage:
            "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
        }}
      >
        <div className="marquee-track" style={{ "--marquee-duration": "42s" }}>
          {loop.map((skill, i) => (
            <SkillTile key={`${skill.name}-${i}`} skill={skill} />
          ))}
        </div>
      </div>
    </div>
  );
}
