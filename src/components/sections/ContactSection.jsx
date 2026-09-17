import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiSend } from "react-icons/fi";
import { personal } from "../../data/resume";
import opDenDen from "../../assets/op-den-den.png";
import opContactRight from "../../assets/op-contact-right.png";
import { AVATAR_STAGE_HEIGHT, AVATAR_STAGE_MAX_WIDTH } from "../../hooks/useAvatarAnchors";

export default function ContactSection({ sectionRef }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Portfolio note from ${name.trim() || "someone"}`,
    );
    const body = encodeURIComponent(
      `${message.trim()}\n\n- ${name.trim()}${email.trim() ? ` · ${email.trim()}` : ""}`,
    );
    window.location.href = `mailto:${personal.email}?subject=${subject}&body=${body}`;
  };

  const fieldStyle = {
    background: "var(--bg-surface)",
    color: "var(--text-primary)",
    border: "1px solid rgba(99,102,241,0.14)",
    boxShadow: "var(--shadow-clay-inset, inset 0 2px 6px rgba(67,56,202,0.04))",
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="section-snap relative min-h-0 lg:min-h-0 lg:h-screen flex flex-col justify-start lg:justify-center px-6 sm:px-8 md:px-16 lg:px-24 py-16 lg:py-16 overflow-x-hidden overflow-y-visible"
    >
      <div className="page-shell grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        <div className="w-full min-w-0 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <p className="clay-section-label">
              <img src={opDenDen} alt="" className="op-mark" draggable={false} />
              Get In Touch
            </p>
            <h2
              className="text-[1.85rem] sm:text-4xl lg:text-5xl font-bold leading-[1.15] mb-3 break-words"
              style={{ color: "var(--text-primary)" }}
            >
              Drop me a{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, #6366f1, #818cf8, #3b82f6)",
                }}
              >
                message.
              </span>
            </h2>
            <p
              className="text-sm sm:text-base max-w-lg leading-relaxed mb-5"
              style={{ color: "var(--text-secondary)" }}
            >
              Have a question, an idea, or just want to say hi? Fill this out and
              it&apos;ll open your mail client ready to send.
            </p>
          </motion.div>

          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="clay-card p-5 sm:p-6 rounded-3xl max-w-xl space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block min-w-0">
                <span
                  className="block text-[11px] tracking-[0.16em] uppercase mb-1.5 font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  Name
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-2xl px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-300/50"
                  style={fieldStyle}
                />
              </label>
              <label className="block min-w-0">
                <span
                  className="block text-[11px] tracking-[0.16em] uppercase mb-1.5 font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-300/50"
                  style={fieldStyle}
                />
              </label>
            </div>

            <label className="block">
              <span
                className="block text-[11px] tracking-[0.16em] uppercase mb-1.5 font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                Message
              </span>
              <textarea
                name="message"
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What are you thinking about?"
                className="w-full rounded-2xl px-4 py-2.5 text-sm outline-none resize-y min-h-[88px] max-h-[160px] transition-shadow focus:ring-2 focus:ring-indigo-300/50"
                style={fieldStyle}
              />
            </label>

            <button
              type="submit"
              className="clay-button clay-button-primary inline-flex items-center justify-center gap-2 px-7 py-3 font-semibold text-sm tracking-wide w-full sm:w-auto"
            >
              Send Message
              <FiSend className="w-4 h-4" />
            </button>
          </motion.form>
        </div>

        <motion.div
          data-avatar-anchor="contact"
          className="hidden lg:flex items-center justify-center relative w-full"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          style={{ zIndex: 2, height: AVATAR_STAGE_HEIGHT, maxWidth: AVATAR_STAGE_MAX_WIDTH, width: "100%" }}
        >
          <img
            src={opContactRight}
            alt=""
            draggable={false}
            className="h-full w-auto max-w-full object-contain object-center lg:object-right select-none pointer-events-none"
          />
        </motion.div>
      </div>
    </section>
  );
}
