import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { personal } from "../data/resume";
import strawHat from "../assets/straw-hat.png";
import opSunny from "../assets/op-sunny.png";
import opWave from "../assets/op-wave.png";

const SOCIALS = [
  {
    label: "GitHub",
    href: personal.github,
    Icon: FaGithub,
    external: true,
    color: "#24292F",
    soft: "rgba(36,41,47,0.08)",
    border: "rgba(36,41,47,0.2)",
    borderHover: "rgba(36,41,47,0.45)",
  },
  {
    label: "LinkedIn",
    href: personal.linkedin,
    Icon: FaLinkedinIn,
    external: true,
    color: "#0A66C2",
    soft: "rgba(10,102,194,0.1)",
    border: "rgba(10,102,194,0.28)",
    borderHover: "rgba(10,102,194,0.55)",
  },
];

export default function Navbar({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [shipVisible, setShipVisible] = useState(false);
  const [hovered, setHovered] = useState(null);
  const targetProgress = useRef(0);
  const smoothRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      // Appear only after a real scroll — not at the top of the page.
      setShipVisible(y > 80);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress.current = max > 0 ? Math.min(1, y / max) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf;
    const tick = () => {
      // Slow ease toward target so the ship glides instead of snapping.
      const next =
        smoothRef.current + (targetProgress.current - smoothRef.current) * 0.06;
      smoothRef.current = next;
      setSmoothProgress(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const goHome = () => onNavigate && onNavigate("hero");
  const [firstName, ...rest] = personal.name.split(" ");
  const lastName = rest.join(" ");

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
      className={`fixed top-0 z-50 transition-all duration-500 overflow-visible ${
        scrolled
          ? "bg-white/70 backdrop-blur-xl border-b border-white/60"
          : "bg-transparent"
      }`}
      style={{
        left: "max(0px, calc((100vw - var(--page-frame-width)) / 2))",
        right: "max(0px, calc((100vw - var(--page-frame-width)) / 2))",
        width: "auto",
        ...(scrolled
          ? { boxShadow: "0 6px 24px rgba(67,56,202,0.08)", overflow: "visible" }
          : { overflow: "visible" }),
      }}
    >
      {/* Scroll progress — Sunny rides an animated ocean strip (sits under the bar) */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height: 22,
          bottom: -6,
          opacity: shipVisible ? 1 : 0,
          transition: "opacity 500ms ease",
          zIndex: 0,
          overflow: "visible",
        }}
        aria-hidden
      >
        <div
          className="absolute left-0 bottom-0 overflow-hidden"
          style={{
            width: `${Math.max(smoothProgress * 100, 0)}%`,
            height: 20,
          }}
        >
          <div
            className="ship-sea-drift absolute inset-y-0 left-0"
            style={{
              width: "calc(100% + 340px)",
              backgroundImage: `url(${opWave})`,
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 100%",
              backgroundPosition: "0 bottom",
              opacity: 0.9,
            }}
          />
        </div>
        <img
          src={opSunny}
          alt=""
          draggable={false}
          className="absolute object-contain"
          style={{
            width: 56,
            height: 48,
            bottom: 2,
            left: `clamp(0%, calc(${smoothProgress * 100}% - 28px), calc(100% - 56px))`,
            filter: "drop-shadow(0 3px 8px rgba(59,130,246,0.35))",
            transform: shipVisible ? "translateY(0)" : "translateY(8px)",
            transition: "transform 500ms ease",
            zIndex: 2,
          }}
        />
      </div>

      <div className="relative z-10 px-6 sm:px-8 md:px-16 lg:px-24">
        <div className="page-shell h-14 sm:h-16 flex items-center justify-between gap-3 overflow-visible">
        <button
          onClick={goHome}
          className="group select-none inline-flex items-center gap-2 sm:gap-3 overflow-visible min-w-0"
          aria-label="Home"
        >
          <img
            src={strawHat}
            alt=""
            width={40}
            height={28}
            className="shrink-0 object-contain transition-transform duration-300 group-hover:-rotate-6"
            style={{ width: 36, height: 25 }}
            draggable={false}
          />
          <span className="inline-flex flex-col items-start overflow-visible min-w-0">
            <span
              className="op-display inline-flex items-baseline gap-1.5 sm:gap-2 overflow-visible"
              style={{
                fontWeight: 700,
                letterSpacing: "0.04em",
                lineHeight: 1.4,
              }}
            >
              <span
                className="text-[0.82rem] sm:text-[1.05rem] truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {firstName}
              </span>
              <span
                className="hidden min-[400px]:inline text-[0.82rem] sm:text-[1.05rem] truncate"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, #C9922A 0%, #E8B84A 45%, #B8860B 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {lastName}
              </span>
            </span>
            <span
              aria-hidden
              className="mt-0.5 rounded-full"
              style={{
                height: 2,
                width: "100%",
                background:
                  "linear-gradient(90deg, #E63946 0%, #E63946 70%, transparent 100%)",
                opacity: 0.85,
              }}
            />
          </span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {SOCIALS.map(
            ({
              label,
              href,
              Icon,
              external,
              color,
              soft,
              border,
              borderHover,
            }) => {
              const isHot = hovered === label;
              return (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  title={label}
                  target={external ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHovered(label)}
                  onMouseLeave={() => setHovered(null)}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl"
                  style={{
                    color: color || "inherit",
                    background: isHot ? soft : "var(--bg-surface)",
                    border: `1.5px solid ${isHot ? borderHover : border}`,
                    boxShadow: isHot
                      ? `0 0 0 3px ${soft}`
                      : "0 2px 8px rgba(67,56,202,0.05)",
                    transition:
                      "background 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
                  }}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" size={16} />
                </a>
              );
            },
          )}
        </div>
        </div>
      </div>
    </motion.nav>
  );
}
