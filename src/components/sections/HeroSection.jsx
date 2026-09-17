import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { motion } from "framer-motion";
import { personal } from "../../data/resume";
import Scene from "../3d/Scene";
import {
  HERO_AVATAR,
  LANDING_AVATAR,
  SITTING_AVATAR,
  CONTACT_AVATAR,
} from "../../data/heroAvatar";
import {
  AVATAR_STAGE_HEIGHT,
  AVATAR_STAGE_MAX_WIDTH,
  useAvatarAnchors,
} from "../../hooks/useAvatarAnchors";
import aboutBg from "../../assets/about-bg.png";
import aboutTable from "../../assets/about-table.png";
import aboutCat from "../../assets/about-cat.png";

const titleVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, delay: 0.3 } },
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function buildHeroAvatarConfig(
  scrollProgress,
  scrollProgress2 = 0,
  scrollProgress3 = 0,
  scrollProgress4 = 0,
) {
  const LAND_AT = 0.94;
  const t1 = Math.min(1, scrollProgress / LAND_AT);

  // Phase 1: HERO (front, centered) → LANDING (turned toward desk)
  const phase1 = {
    position: {
      x: lerp(HERO_AVATAR.position.x, LANDING_AVATAR.position.x, t1),
      y: lerp(HERO_AVATAR.position.y, LANDING_AVATAR.position.y, t1),
      z: lerp(HERO_AVATAR.position.z, LANDING_AVATAR.position.z, t1),
    },
    rotation: {
      x: lerp(HERO_AVATAR.rotation.x, LANDING_AVATAR.rotation.x, t1),
      y: lerp(HERO_AVATAR.rotation.y, LANDING_AVATAR.rotation.y, t1),
      z: lerp(HERO_AVATAR.rotation.z, LANDING_AVATAR.rotation.z, t1),
    },
    scale: lerp(HERO_AVATAR.scale, LANDING_AVATAR.scale, t1),
  };

  // Phase 2: LANDING → HERO — stand up, face forward for Projects
  // Hold the fall orientation until he's nearly arrived, then settle.
  const P2_FACE_DONE = 0.95;
  const t2 = Math.min(1, Math.max(0, scrollProgress2 / P2_FACE_DONE));

  const phase2 = {
    position: {
      x: lerp(phase1.position.x, HERO_AVATAR.position.x, t2),
      y: lerp(phase1.position.y, HERO_AVATAR.position.y, t2),
      z: lerp(phase1.position.z, HERO_AVATAR.position.z, t2),
    },
    rotation: {
      x: lerp(phase1.rotation.x, HERO_AVATAR.rotation.x, t2),
      y: lerp(phase1.rotation.y, HERO_AVATAR.rotation.y, t2),
      z: lerp(phase1.rotation.z, HERO_AVATAR.rotation.z, t2),
    },
    scale: lerp(phase1.scale, HERO_AVATAR.scale, t2),
  };

  // Phase 3: HERO → SITTING — bring the avatar down onto the About desk.
  // Position eases toward the desk through the fall. Keep him upright while
  // Falling (the sit pitch would tip him sideways mid-air and looks broken);
  // only blend into the sit rotation right as the Sitting clip takes over.
  const P3_SIT_DONE = 0.95;
  const P3_SIT_ROT_START = 0.88;
  const t3 = Math.min(1, Math.max(0, scrollProgress3 / P3_SIT_DONE));
  const t3rot = Math.min(
    1,
    Math.max(
      0,
      (scrollProgress3 - P3_SIT_ROT_START) / (P3_SIT_DONE - P3_SIT_ROT_START),
    ),
  );

  const phase3 = {
    position: {
      x: lerp(phase2.position.x, SITTING_AVATAR.position.x, t3),
      y: lerp(phase2.position.y, SITTING_AVATAR.position.y, t3),
      z: lerp(phase2.position.z, SITTING_AVATAR.position.z, t3),
    },
    rotation: {
      x: lerp(phase2.rotation.x, SITTING_AVATAR.rotation.x, t3rot),
      y: lerp(phase2.rotation.y, SITTING_AVATAR.rotation.y, t3rot),
      z: lerp(phase2.rotation.z, SITTING_AVATAR.rotation.z, t3rot),
    },
    scale: phase2.scale,
  };

  // Phase 4: SITTING → CONTACT — stand back up and settle beside the globe.
  // Rise ~40% of the way from sit recline → upright WHILE still on the Sitting
  // hip-pivot, then switch to Falling and finish the remaining ~60% of the
  // upright during the fall. Fully upright before Falling looked stiff; fully
  // reclined into Falling flung him flat. 40/60 splits the difference.
  const P4_ARRIVE = 0.95;
  const P4_FALL_START = 0.15;
  const P4_UPRIGHT_DONE = 0.5;
  const t4 = Math.min(1, Math.max(0, scrollProgress4 / P4_ARRIVE));
  let t4rot = 0;
  if (scrollProgress4 <= 0) {
    t4rot = 0;
  } else if (scrollProgress4 < P4_FALL_START) {
    // Sitting beat: 0 → 0.4
    t4rot = 0.4 * (scrollProgress4 / P4_FALL_START);
  } else if (scrollProgress4 < P4_UPRIGHT_DONE) {
    // Falling beat: 0.4 → 1.0
    t4rot =
      0.4 +
      0.6 *
        ((scrollProgress4 - P4_FALL_START) / (P4_UPRIGHT_DONE - P4_FALL_START));
  } else {
    t4rot = 1;
  }

  return {
    ...HERO_AVATAR,
    position: {
      x: lerp(phase3.position.x, CONTACT_AVATAR.position.x, t4),
      y: lerp(phase3.position.y, CONTACT_AVATAR.position.y, t4),
      z: lerp(phase3.position.z, CONTACT_AVATAR.position.z, t4),
    },
    rotation: {
      x: lerp(phase3.rotation.x, CONTACT_AVATAR.rotation.x, t4rot),
      y: lerp(phase3.rotation.y, CONTACT_AVATAR.rotation.y, t4rot),
      z: lerp(phase3.rotation.z, CONTACT_AVATAR.rotation.z, t4rot),
    },
    scale: lerp(phase3.scale, CONTACT_AVATAR.scale, t4),
  };
}

export default function HeroSection({
  sectionRef,
  activeSection,
  enable3D = true,
  scrollProgress = 0,
  scrollProgress2 = 0,
  scrollProgress2Raw = 0,
  scrollProgress3 = 0,
  scrollProgress4 = 0,
  onNavigate,
}) {
  const nameParts = personal.name.split(" ");
  const gradientText = {
    background: "linear-gradient(120deg, var(--clay-purple), var(--clay-blue))",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
  };
  const FOCUS = ["Backend Systems", "Operational Workflows", "Automations"];

  // Measured section targets — adapts when viewport / stage height changes.
  const anchors = useAvatarAnchors(enable3D);

  // Phase 1 — Hero → Experience: Standing → Falling → Typing
  const LAND_AT = 0.94;
  const isFalling = scrollProgress > 0;
  const hasLanded = scrollProgress > LAND_AT;
  const t1fall = Math.min(1, scrollProgress / LAND_AT);
  const phase1Offset = t1fall * anchors.experience;

  // Phase 2 — Experience → Projects: Typing → Falling → Standing
  // Fall translate starts immediately with p2 (no dead zone) so he tracks scroll.
  // Standing only after he has nearly arrived in Projects (not mid-fall).
  const P2_FALL_START = 0;
  const P2_STAND_AT = 0.92;

  const fallP2 = Math.min(1, Math.max(0, scrollProgress2Raw));
  const phase2Offset = fallP2 * (anchors.projects - anchors.experience);

  // Phase 3 — Projects → About: Standing → Falling → Sitting
  // Fall translate starts immediately with p3. Sitting only when he reaches the desk.
  const P3_FALL_START = 0;
  const P3_SIT_AT = 0.92;
  const fallP3 = Math.min(1, Math.max(0, scrollProgress3));
  const phase3Offset = fallP3 * (anchors.about - anchors.projects);

  // Phase 4 — About → Contact: Sitting → (partial rise) → Falling → Standing.
  // Must match P4_FALL_START in buildHeroAvatarConfig (rotation hits ~40% here).
  const P4_FALL_START = 0.15;
  const P4_STAND_AT = 0.92;
  const fallP4 = Math.min(1, Math.max(0, scrollProgress4));
  const phase4Offset = fallP4 * (anchors.contact - anchors.about);

  const fallOffset = phase1Offset + phase2Offset + phase3Offset + phase4Offset;

  // About backdrop (lamp + cat) lives INSIDE this canvas container so it locks
  // to the avatar at every viewport.
  const aboutOffset = anchors.about;
  const contactOffset = anchors.contact;
  const propStageStyle = (z) => ({
    position: "absolute",
    top: 0,
    left: "50%",
    height: "100%",
    aspectRatio: "1",
    transform: `translateX(-50%) translateY(${aboutOffset}px)`,
    zIndex: z,
    pointerEvents: "none",
  });
  const propImg = {
    position: "absolute",
    height: "auto",
    userSelect: "none",
    pointerEvents: "none",
  };

  // Contact accent stage — same static pin pattern as About props.
  const globeStageStyle = {
    position: "absolute",
    top: 0,
    left: "50%",
    height: "100%",
    aspectRatio: "1",
    transform: `translateX(-50%) translateY(${contactOffset}px)`,
    zIndex: 3,
    pointerEvents: "none",
  };

  const swimOffsetX = 0;
  const swimRotateY = 0;

  let heroAnimation;
  if (scrollProgress4 >= P4_STAND_AT) {
    heroAnimation = "Standing";
  } else if (scrollProgress4 > P4_FALL_START) {
    heroAnimation = "Falling";
  } else if (scrollProgress3 >= P3_SIT_AT) {
    heroAnimation = "Sitting";
  } else if (scrollProgress3 > P3_FALL_START) {
    heroAnimation = "Falling";
  } else if (scrollProgress2 >= P2_STAND_AT) {
    heroAnimation = "Standing";
  } else if (scrollProgress2 > P2_FALL_START) {
    heroAnimation = "Falling";
  } else if (hasLanded) {
    heroAnimation = "Typing";
  } else if (isFalling) {
    heroAnimation = "Falling";
  } else {
    heroAnimation = "Standing";
  }

  const heroAvatarConfig = buildHeroAvatarConfig(
    scrollProgress,
    scrollProgress2,
    scrollProgress3,
    scrollProgress4,
  );

  // Idle "tired" loop — while standing (Hero / Projects / Contact), alternate
  // Standing ↔ ArmStretching. Skipped when ?capture=1 so README shots stay still.
  const captureMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("capture");
  const heroIdle =
    scrollProgress === 0 &&
    scrollProgress2 === 0 &&
    scrollProgress3 === 0 &&
    scrollProgress4 === 0;
  const projectsStanding =
    scrollProgress2 >= P2_STAND_AT &&
    scrollProgress3 === 0 &&
    scrollProgress4 === 0;
  const contactStanding = scrollProgress4 >= P4_STAND_AT;
  const idleActive =
    !captureMode && (heroIdle || projectsStanding || contactStanding);
  const [idlePose, setIdlePose] = useState("Standing");

  useEffect(() => {
    if (!idleActive) {
      setIdlePose("Standing");
      return;
    }
    let timer;
    let stretching = false;
    const STAND_MS = 5000;
    const STRETCH_MS = 3800;
    const cycle = () => {
      stretching = !stretching;
      setIdlePose(stretching ? "ArmStretching" : "Standing");
      timer = setTimeout(cycle, stretching ? STRETCH_MS : STAND_MS);
    };
    timer = setTimeout(cycle, STAND_MS);
    return () => clearTimeout(timer);
  }, [idleActive]);

  const finalHeroAnimation = idleActive ? idlePose : heroAnimation;

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="section-snap relative min-h-0 lg:min-h-screen flex items-start lg:items-center px-6 sm:px-8 md:px-16 lg:px-24"
      style={{
        overflow: "visible",
        zIndex:
          scrollProgress2 > 0.155 || scrollProgress3 > 0 || scrollProgress4 > 0
            ? 20
            : 1,
      }}
    >
      <div
        className="page-shell grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        style={{ overflow: "visible" }}
      >
        <div className="relative z-[1] pt-20 pb-10 lg:py-0">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-lg md:text-xl font-medium mb-3 flex items-center gap-2"
            style={{ color: "var(--text-secondary)" }}
          >
            <span role="img" aria-label="wave">
              👋
            </span>
            Hi, I&rsquo;m
          </motion.p>

          <motion.h1
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            className="text-[2.6rem] sm:text-6xl lg:text-7xl font-bold leading-[1.15] mb-5 break-words"
          >
            {nameParts.map((word, wi) => (
              <span key={wi} className="block" style={gradientText}>
                {word}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="text-lg md:text-xl font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            {personal.title}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="text-base md:text-lg max-w-xl mb-6 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {personal.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="flex flex-wrap gap-2.5 mb-10"
          >
            {FOCUS.map((f) => (
              <span
                key={f}
                className="clay-pill px-3.5 py-1.5 text-xs font-semibold tracking-wide"
                style={{ color: "var(--text-secondary)" }}
              >
                {f}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.7 }}
            className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4"
          >
            <a
              href="#experience"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate)
                  onNavigate("experience", { duration: 400, kickstart: true });
                else
                  document
                    .getElementById("experience")
                    ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="clay-button clay-button-primary px-7 py-3 font-semibold text-sm tracking-wide text-center"
            >
              View My Work
            </a>
            <a
              href={personal.resumePdf}
              download
              className="clay-button clay-button-secondary px-7 py-3 font-medium text-sm tracking-wide text-center"
            >
              Download Resume
            </a>
          </motion.div>
        </div>

        {enable3D && (
          <div
            data-avatar-stage
            className="relative w-full mx-auto lg:mx-0"
            style={{
              height: AVATAR_STAGE_HEIGHT,
              maxWidth: AVATAR_STAGE_MAX_WIDTH,
              width: "100%",
              zIndex: 50,
              overflow: "visible",
            }}
          >
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: -1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
            >
              <svg
                viewBox="0 0 600 720"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                }}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Lavender blob — richer purple-periwinkle */}
                  <linearGradient
                    id="lavBlob"
                    x1="20%"
                    y1="5%"
                    x2="85%"
                    y2="95%"
                  >
                    <stop offset="0%" stopColor="#cdc0ff" />
                    <stop offset="50%" stopColor="#b5a5ff" />
                    <stop offset="100%" stopColor="#c8baff" />
                  </linearGradient>
                  {/* Blue blob — deeper powder blue */}
                  <linearGradient
                    id="blueBlob"
                    x1="10%"
                    y1="15%"
                    x2="88%"
                    y2="88%"
                  >
                    <stop offset="0%" stopColor="#a8d4f5" />
                    <stop offset="55%" stopColor="#90c2ee" />
                    <stop offset="100%" stopColor="#a2d0f5" />
                  </linearGradient>
                  {/* Floor shadow — radial fade */}
                  <radialGradient id="floorShadow" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#7060b0" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#7060b0" stopOpacity="0" />
                  </radialGradient>
                  {/* Drop shadows for 3D blob depth */}
                  <filter
                    id="lavShadow"
                    x="-15%"
                    y="-15%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="6"
                      dy="10"
                      stdDeviation="18"
                      floodColor="#8070c0"
                      floodOpacity="0.35"
                    />
                  </filter>
                  <filter
                    id="blueShadow"
                    x="-15%"
                    y="-15%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="4"
                      dy="8"
                      stdDeviation="14"
                      floodColor="#5088b8"
                      floodOpacity="0.30"
                    />
                  </filter>
                  {/* Sphere gradients for accent dots */}
                  <radialGradient id="dotOrange" cx="38%" cy="35%" r="62%">
                    <stop offset="0%" stopColor="#ffcdb8" />
                    <stop offset="100%" stopColor="#e88060" />
                  </radialGradient>
                  <radialGradient id="dotBlue" cx="38%" cy="35%" r="62%">
                    <stop offset="0%" stopColor="#b0d0ff" />
                    <stop offset="100%" stopColor="#6090d8" />
                  </radialGradient>
                  <radialGradient id="dotPurple" cx="38%" cy="35%" r="62%">
                    <stop offset="0%" stopColor="#d8b8ff" />
                    <stop offset="100%" stopColor="#9060c8" />
                  </radialGradient>
                </defs>

                {/* ══ MAIN LAVENDER BLOB ══
                  Catmull-Rom spline (CP1=P1+(P2-P0)/6, CP2=P2-(P3-P1)/6).
                  Zero corners, smooth passage through every anchor.
                  Two-lobe peanut: L-peak(148,55), neck(295,95), R-peak(442,50). */}
                {/* scale(0.88) around blob center (297,242) = shrink ~12% */}
                <path
                  d="
                  M 148 55
                  C 187 46, 246 96, 295 95
                  C 344 94, 403 37, 442 50
                  C 481 63, 513 128, 530 175
                  C 547 222, 559 289, 545 330
                  C 531 371, 487 403, 445 420
                  C 403 437, 345 435, 295 435
                  C 245 435, 186 441, 145 418
                  C 104 395, 64 340, 50 295
                  C 36 250, 46 188, 62 148
                  C 78 108, 109 64, 148 55
                  Z
                "
                  fill="url(#lavBlob)"
                  opacity="0.88"
                  transform="translate(297,242) scale(0.88) translate(-297,-242)"
                  filter="url(#lavShadow)"
                />

                {/* ══ LOWER BLUE BLOB ══
                  Catmull-Rom smooth. Wide flat top, rounded lower-right extension.
                  Gap from lavender bottom (y≈435) to blue top (y≈462): ~45 units. */}
                {/* translate(0,40) = move blue blob down 40 units */}
                <path
                  d="
                  M 175 480
                  C 204 468, 253 468, 295 465
                  C 337 462, 391 460, 425 462
                  C 459 464, 476 466, 498 478
                  C 520 490, 549 513, 558 535
                  C 567 557, 572 591, 552 610
                  C 532 629, 479 644, 438 652
                  C 397 660, 349 661, 305 660
                  C 261 659, 207 658, 175 648
                  C 143 638, 121 618, 112 600
                  C 103 582, 110 558, 120 538
                  C 130 518, 146 492, 175 480
                  Z
                "
                  fill="url(#blueBlob)"
                  opacity="0.85"
                  transform="translate(0,40)"
                  filter="url(#blueShadow)"
                />

                {/* ── Floor shadow platform ── */}
                <ellipse
                  cx="295"
                  cy="706"
                  rx="162"
                  ry="20"
                  fill="url(#floorShadow)"
                />

                {/* ── Accent spheres — radial gradient gives 3D sphere look ── */}
                {/* Orange – right side at chest height */}
                <circle cx="528" cy="288" r="22" fill="url(#dotOrange)" />
                {/* Blue – left side at waist height */}
                <circle cx="28" cy="488" r="19" fill="url(#dotBlue)" />
                {/* Purple – lower-right */}
                <circle cx="534" cy="448" r="17" fill="url(#dotPurple)" />
              </svg>
            </motion.div>

            {enable3D && (
              <>
                {/* About scene — BEHIND the avatar (lamp backdrop + cat) */}
                <div style={propStageStyle(4)} aria-hidden>
                  <img
                    src={aboutBg}
                    alt=""
                    draggable={false}
                    style={{
                      ...propImg,
                      left: "-3.60%",
                      top: "12.94%",
                      width: "107.35%",
                    }}
                  />
                  <img
                    src={aboutCat}
                    alt=""
                    draggable={false}
                    style={{
                      ...propImg,
                      left: "42%",
                      top: "68%",
                      width: "18%",
                    }}
                  />
                </div>

                {/* Contact island art lives in ContactSection behind the avatar. */}
                <div style={globeStageStyle} aria-hidden />

                <Canvas
                  style={{
                    background: "transparent",
                    width: "140%",
                    height: "100%",
                    position: "relative",
                    left: "-20%",
                    zIndex: 5,
                    transform: `translateY(${fallOffset}px) translateX(${swimOffsetX}px)`,
                    pointerEvents: "none",
                    transition:
                      scrollProgress === 0 ? "transform 0.4s ease-out" : "none",
                  }}
                  gl={{
                    alpha: true,
                    antialias: true,
                    premultipliedAlpha: true,
                  }}
                  onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                  }}
                  frameloop="always"
                >
                  <Suspense fallback={null}>
                    <Scene
                      avatarConfig={heroAvatarConfig}
                      animation={finalHeroAnimation}
                      extraRotationY={swimRotateY}
                    />
                    <Preload all />
                  </Suspense>
                </Canvas>

                {/* Contact accent spheres — in FRONT of the avatar (same dots as Hero) */}
                <div
                  style={{
                    ...globeStageStyle,
                    zIndex: 8,
                    opacity: Math.min(
                      1,
                      Math.max(0, (scrollProgress4 - 0.35) / 0.4),
                    ),
                  }}
                  aria-hidden
                >
                  <svg
                    viewBox="0 0 600 720"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                    }}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <radialGradient
                        id="contactHeroDotOrange"
                        cx="38%"
                        cy="35%"
                        r="62%"
                      >
                        <stop offset="0%" stopColor="#ffcdb8" />
                        <stop offset="100%" stopColor="#e88060" />
                      </radialGradient>
                      <radialGradient
                        id="contactHeroDotBlue"
                        cx="38%"
                        cy="35%"
                        r="62%"
                      >
                        <stop offset="0%" stopColor="#b0d0ff" />
                        <stop offset="100%" stopColor="#6090d8" />
                      </radialGradient>
                      <radialGradient
                        id="contactHeroDotPurple"
                        cx="38%"
                        cy="35%"
                        r="62%"
                      >
                        <stop offset="0%" stopColor="#d8b8ff" />
                        <stop offset="100%" stopColor="#9060c8" />
                      </radialGradient>
                    </defs>
                    <circle
                      cx="520"
                      cy="210"
                      r="22"
                      fill="url(#contactHeroDotOrange)"
                    />
                    <circle
                      cx="78"
                      cy="340"
                      r="19"
                      fill="url(#contactHeroDotBlue)"
                    />
                    <circle
                      cx="540"
                      cy="470"
                      r="17"
                      fill="url(#contactHeroDotPurple)"
                    />
                    <circle
                      cx="120"
                      cy="520"
                      r="14"
                      fill="url(#contactHeroDotOrange)"
                      opacity="0.85"
                    />
                    <circle
                      cx="480"
                      cy="560"
                      r="12"
                      fill="url(#contactHeroDotBlue)"
                      opacity="0.9"
                    />
                  </svg>
                </div>

                {/* About desk — IN FRONT of the avatar (glowing pedestal) */}
                <div style={propStageStyle(6)} aria-hidden>
                  <img
                    src={aboutTable}
                    alt=""
                    draggable={false}
                    style={{
                      ...propImg,
                      left: "8%",
                      top: "54%",
                      width: 460,
                      maxWidth: "72%",
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {enable3D && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span
            className="text-xs tracking-[0.3em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Scroll
          </span>
          <div
            className="w-px h-12 animate-pulse"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--clay-purple), transparent)",
            }}
          />
        </motion.div>
      )}
    </section>
  );
}
