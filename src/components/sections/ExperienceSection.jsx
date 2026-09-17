import React from "react";
import { motion } from "framer-motion";
import { experience } from "../../data/resume";
import deskScene from "../../assets/desk-scene.png";
import { HiOutlineCalendar, HiOutlineLocationMarker } from "react-icons/hi";
import opHats from "../../assets/op-hats.png";
import { EXPERIENCE_DESK } from "../../data/heroAvatar";
import { useIsDesktop } from "../../hooks/useMediaQuery";

export default function ExperienceSection({ sectionRef }) {
  const isDesktop = useIsDesktop();

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="section-snap relative min-h-0 lg:min-h-screen flex items-start lg:items-center px-6 sm:px-8 md:px-16 lg:px-24 pt-16 lg:pt-0"
      style={{ overflow: "visible", zIndex: 10 }}
    >
      <div className="page-shell grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* ── Left column ── */}
        <div className="relative py-8 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <p className="clay-section-label">
              <img src={opHats} alt="" className="op-mark" draggable={false} />
              Work Experience
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            <div
              className="absolute left-0 top-0 bottom-0 w-px"
              style={{
                background:
                  "linear-gradient(to bottom, var(--clay-purple), var(--clay-lavender), transparent)",
              }}
            />

            <div className="space-y-8 pl-10">
              {experience.map((job, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="relative"
                  style={{ opacity: job.current ? 1 : 0.78 }}
                >
                  <div className="absolute -left-[2.9rem] top-1.5 flex items-center justify-center">
                    {job.current ? (
                      <span className="relative flex h-4 w-4">
                        <span
                          className="absolute inset-0 rounded-full animate-ping"
                          style={{
                            backgroundColor: "var(--clay-green)",
                            opacity: 0.35,
                          }}
                        />
                        <span
                          className="relative w-4 h-4 rounded-full border-2"
                          style={{
                            backgroundColor: "var(--clay-green)",
                            borderColor: "#fff",
                            boxShadow: "0 0 0 3px rgba(52, 211, 153, 0.25)",
                          }}
                        />
                      </span>
                    ) : (
                      <span
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                        style={{
                          backgroundColor: "var(--bg-elevated)",
                          borderColor: "rgba(148, 163, 184, 0.7)",
                        }}
                      >
                        <span
                          className="block w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: "var(--text-muted)" }}
                        />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3
                        className="text-xl font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {job.company}
                      </h3>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold rounded-full tracking-wider uppercase"
                        style={
                          job.current
                            ? {
                                color: "#047857",
                                backgroundColor: "rgba(52, 211, 153, 0.16)",
                                border: "1px solid rgba(16, 185, 129, 0.45)",
                              }
                            : {
                                color: "var(--text-muted)",
                                backgroundColor: "rgba(148, 163, 184, 0.12)",
                                border: "1px solid rgba(148, 163, 184, 0.35)",
                              }
                        }
                      >
                        {job.current ? (
                          <>
                            <span
                              className="w-1.5 h-1.5 rounded-full animate-pulse"
                              style={{ backgroundColor: "#10b981" }}
                            />
                            Present
                          </>
                        ) : (
                          "Completed"
                        )}
                      </span>
                    </div>
                    <p
                      className="text-sm font-medium mt-1"
                      style={{
                        color: job.current
                          ? "var(--clay-purple)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {job.role}
                    </p>
                    <div
                      className="flex items-center gap-4 mt-2 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <span className="flex items-center gap-1.5">
                        <HiOutlineCalendar className="w-3.5 h-3.5" />
                        {job.period}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HiOutlineLocationMarker className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/*
          Desk: desktop keeps locked EXPERIENCE_DESK (avatar sit pose).
          Mobile: fluid, centered, no scale/translate so it can't overflow.
        */}
        <motion.div
          data-avatar-anchor="experience"
          className="relative flex justify-center lg:justify-start mt-8 lg:mt-0 w-full overflow-visible"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          style={{ zIndex: 15 }}
        >
          <div
            className="relative"
            style={
              isDesktop
                ? {
                    width: EXPERIENCE_DESK.width,
                    transform: `translate(${EXPERIENCE_DESK.translateX}px, ${EXPERIENCE_DESK.translateY}px) scale(${EXPERIENCE_DESK.scale})`,
                    transformOrigin: "center center",
                  }
                : {
                    width: "100%",
                    maxWidth: EXPERIENCE_DESK.mobileMaxWidth,
                    transform: "none",
                    marginInline: "auto",
                  }
            }
          >
            <img
              src={deskScene}
              alt="Developer at desk"
              className="w-full h-auto object-contain select-none pointer-events-none block"
              draggable={false}
            />
            {isDesktop && (
              <span
                data-avatar-seat="experience"
                aria-hidden
                className="absolute pointer-events-none"
                style={{
                  left: "50%",
                  top: "45%",
                  width: 1,
                  height: 1,
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
