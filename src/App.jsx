import React, { useState, useRef, useEffect, useCallback } from "react";

import Navbar from "./components/Navbar";
import CustomCursor from "./components/CustomCursor";
import HeroSection from "./components/sections/HeroSection";
import ExperienceSection from "./components/sections/ExperienceSection";
import ProjectsSection from "./components/sections/ProjectsSection";
import AboutSection from "./components/sections/AboutSection";
import ContactSection from "./components/sections/ContactSection";
import { useIsDesktop } from "./hooks/useMediaQuery";
import { supports3D } from "./utils/capabilities";
import { smoothScrollTo } from "./utils/smoothScroll";

const SECTIONS = ["hero", "experience", "projects", "about", "contact"];

export default function App() {
  const [activeSection, setActiveSection] = useState("hero");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollProgress2, setScrollProgress2] = useState(0);
  const [scrollProgress2Raw, setScrollProgress2Raw] = useState(0);
  const [scrollProgress3, setScrollProgress3] = useState(0);
  const [scrollProgress4, setScrollProgress4] = useState(0);

  // The scroll-driven 3D choreography only runs on desktop-sized viewports
  // with a capable GPU. Phones, tablets, reduced-motion, and old machines
  // get clean stacked sections with static artwork instead.
  const isDesktop = useIsDesktop();
  const [can3D] = useState(() => supports3D());
  const enable3D = isDesktop && can3D;

  const refs = useRef({});

  const registerRef = (id) => (el) => {
    if (el) refs.current[id] = el;
  };

  const goToSection = useCallback((indexOrId, opts) => {
    const id =
      typeof indexOrId === "string" ? indexOrId : SECTIONS[indexOrId];
    if (!id) return;
    // Eased scroll so the avatar choreography plays through the travel.
    // Callers can pass { duration, kickstart } for snappier CTAs.
    smoothScrollTo(id, opts);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.35, rootMargin: "-80px 0px 0px 0px" },
    );

    SECTIONS.forEach((id) => {
      if (refs.current[id]) observer.observe(refs.current[id]);
    });

    return () => observer.disconnect();
  }, []);

  // Avatar fall progress is driven directly by scrollY (pre-snap behavior).
  const handleScroll = useCallback(() => {
    const viewH = window.innerHeight;
    const y = window.scrollY;

    // Phase 1: Hero → Experience (Standing → Falling → Typing)
    // Hold the standing pose a bit longer before the tumble begins so the fall
    // doesn't kick off the instant the user nudges the wheel. End the fall by
    // the time Experience hits the top so Typing + desk alignment are fully on
    // (hands on the laptop) — delaying the start without shortening the end
    // left him mid-air / mid-turn over the desk.
    const fallStart = viewH * 0.22;
    const fallEnd = viewH * 1.02;
    const progress = Math.max(
      0,
      Math.min(1, (y - fallStart) / (fallEnd - fallStart)),
    );
    setScrollProgress(progress);

    // Phase 2: Experience → Projects (Typing → Falling → Standing)
    // Leave Experience early and finish the fall as Projects hits the top so the
    // avatar stays centered on the right half instead of lagging at the top.
    const expEl = document.getElementById("experience");
    const projectsEl = document.getElementById("projects");
    if (expEl && projectsEl) {
      const phase2Start = expEl.offsetTop + expEl.offsetHeight * 0.15;
      const phase2End = projectsEl.offsetTop;
      const span2 = Math.max(1, phase2End - phase2Start);
      const p2Raw = Math.max(0, (y - phase2Start) / span2);
      setScrollProgress2(Math.min(1, p2Raw));
      setScrollProgress2Raw(p2Raw);
    }

    // Phase 3: Projects → About (Standing → Falling → Sitting)
    // Start leaving Projects early so the fall finishes as About hits the top
    // of the viewport (avoids hovering above the stool while About is already visible).
    const aboutEl = document.getElementById("about");
    if (projectsEl && aboutEl) {
      const phase3Start = projectsEl.offsetTop + projectsEl.offsetHeight * 0.15;
      const phase3End = aboutEl.offsetTop;
      const span = Math.max(1, phase3End - phase3Start);
      const p3 = Math.max(0, Math.min(1, (y - phase3Start) / span));
      setScrollProgress3(p3);
    }

    // Phase 4: About → Contact (Sitting → Falling → Standing beside the globe)
    // Same early-leave pattern as the other phases so the landing lines up
    // with Contact hitting the top of the viewport.
    const contactEl = document.getElementById("contact");
    if (aboutEl && contactEl) {
      const phase4Start = aboutEl.offsetTop + aboutEl.offsetHeight * 0.15;
      const phase4End = contactEl.offsetTop;
      const span4 = Math.max(1, phase4End - phase4Start);
      const p4 = Math.max(0, Math.min(1, (y - phase4Start) / span4));
      setScrollProgress4(p4);
    }
  }, []);

  useEffect(() => {
    if (!enable3D) {
      // Static layout — pin all avatar phases to their start so nothing floats.
      setScrollProgress(0);
      setScrollProgress2(0);
      setScrollProgress2Raw(0);
      setScrollProgress3(0);
      setScrollProgress4(0);
      return;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll, enable3D]);

  return (
    <div className="relative" style={{ background: "var(--bg-base)" }}>
      <CustomCursor />
      <div className="page-frame">
        <Navbar activeSection={activeSection} onNavigate={goToSection} />

        <main className="relative" style={{ overflow: "visible" }}>
          <HeroSection
            sectionRef={registerRef("hero")}
            activeSection={activeSection}
            enable3D={enable3D}
            scrollProgress={scrollProgress}
            scrollProgress2={scrollProgress2}
            scrollProgress2Raw={scrollProgress2Raw}
            scrollProgress3={scrollProgress3}
            scrollProgress4={scrollProgress4}
            onNavigate={goToSection}
          />

          <div
            className={`absolute pointer-events-none ${enable3D ? "hidden lg:block" : "hidden"}`}
            style={{
              zIndex: 0,
              top: "100vh",
              right: "14%",
              width: 420,
              height: 390,
              marginTop: 155,
              transform: "translateX(-43px)",
            }}
          >
            <svg
              viewBox="0 0 720 670"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="splashGrad" x1="5%" y1="0%" x2="95%" y2="100%">
                  <stop offset="0%" stopColor="#cdc0ff" />
                  <stop offset="35%" stopColor="#b5a5ff" />
                  <stop offset="70%" stopColor="#c8baff" />
                  <stop offset="100%" stopColor="#d8d0ff" />
                </linearGradient>
                <filter id="splashShadow" x="-10%" y="-10%" width="130%" height="130%">
                  <feDropShadow
                    dx="3"
                    dy="5"
                    stdDeviation="10"
                    floodColor="#8070c0"
                    floodOpacity="0.22"
                  />
                </filter>
                <radialGradient id="splashDotPurple" cx="38%" cy="35%" r="62%">
                  <stop offset="0%" stopColor="#d8c8ff" />
                  <stop offset="100%" stopColor="#9080d0" />
                </radialGradient>
                <radialGradient id="splashDropOrange" cx="40%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#ffcdb8" />
                  <stop offset="100%" stopColor="#e88060" />
                </radialGradient>
                <radialGradient id="splashDropBlue" cx="40%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#b0d0ff" />
                  <stop offset="100%" stopColor="#6090d8" />
                </radialGradient>
              </defs>

              <path
                d="
                M 280 72
                C 270 42, 245 28, 220 55
                C 195 82, 220 115, 250 125
                C 230 138, 215 155, 245 168
                C 200 165, 148 142, 115 158
                C 82 174, 78 210, 108 228
                C 80 238, 48 255, 42 290
                C 36 325, 55 345, 85 342
                C 62 360, 38 388, 48 420
                C 58 452, 90 468, 118 452
                C 108 478, 118 512, 148 535
                C 178 558, 208 538, 215 510
                C 225 530, 255 555, 290 558
                C 325 561, 345 538, 340 512
                C 360 535, 395 548, 428 545
                C 461 542, 478 518, 468 495
                C 492 510, 528 515, 558 498
                C 588 481, 592 448, 572 428
                C 598 418, 622 395, 632 362
                C 642 329, 628 302, 602 298
                C 625 278, 642 248, 638 218
                C 634 188, 608 172, 582 182
                C 592 155, 582 122, 558 105
                C 534 88, 510 108, 505 132
                C 488 112, 465 88, 438 78
                C 411 68, 390 82, 388 105
                C 372 85, 345 65, 318 62
                C 298 59, 285 62, 280 72
                Z
              "
                fill="url(#splashGrad)"
                opacity="0.82"
                filter="url(#splashShadow)"
              />

              <path
                d="M 175 78 C 178 58, 162 42, 155 62 C 148 82, 165 95, 175 78 Z"
                fill="url(#splashDotPurple)"
                opacity="0.85"
              />
              <path
                d="M 608 508 C 618 492, 632 498, 625 515 C 618 532, 600 525, 608 508 Z"
                fill="url(#splashDotPurple)"
                opacity="0.85"
              />
              <path
                d="M 660 285 C 672 270, 685 278, 680 295 C 675 312, 655 308, 660 285 Z"
                fill="url(#splashDropOrange)"
                opacity="0.9"
              />
              <path
                d="M 95 510 C 88 495, 72 498, 78 515 C 84 532, 102 528, 95 510 Z"
                fill="url(#splashDropOrange)"
                opacity="0.9"
              />
              <path
                d="M 32 365 C 18 355, 8 365, 15 380 C 22 395, 40 385, 32 365 Z"
                fill="url(#splashDropBlue)"
                opacity="0.9"
              />
              <path
                d="M 520 578 C 528 562, 542 568, 538 585 C 534 602, 515 595, 520 578 Z"
                fill="url(#splashDropBlue)"
                opacity="0.9"
              />

              <circle cx="310" cy="38" r="7" fill="url(#splashDotPurple)" opacity="0.7" />
              <circle cx="478" cy="55" r="5" fill="url(#splashDotPurple)" opacity="0.6" />
              <circle cx="665" cy="345" r="6" fill="url(#splashDotPurple)" opacity="0.65" />
              <circle cx="145" cy="565" r="5" fill="url(#splashDotPurple)" opacity="0.6" />
              <circle cx="405" cy="585" r="7" fill="url(#splashDotPurple)" opacity="0.65" />
            </svg>
          </div>

          <ExperienceSection sectionRef={registerRef("experience")} />
          <ProjectsSection sectionRef={registerRef("projects")} />
          <AboutSection sectionRef={registerRef("about")} />
          <ContactSection sectionRef={registerRef("contact")} />
        </main>
      </div>
    </div>
  );
}
