import { useEffect, useRef } from "react";
import swordsDefault from "../assets/cursor-swords-default.png";
import swordsHover from "../assets/cursor-swords-hover.png";
import swordsClick from "../assets/cursor-swords-click.png";

/** Tip of the blades (hotspot), as a fraction of the sprite box. */
const TIP = { x: 0.14, y: 0.12 };

const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, label, .clay-button, .clay-card-hover";

function playSlash(audioCtx) {
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume();

  const t = audioCtx.currentTime;
  const sr = audioCtx.sampleRate;

  // Blade cutting air — short, bright noise with a fast downward sweep
  const dur = 0.11;
  const n = Math.floor(sr * dur);
  const buf = audioCtx.createBuffer(1, n, sr);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) {
    const env = Math.exp(-i / (n * 0.045));
    // slight AM chirp so it reads as a slash, not a puff
    const chirp = Math.sin((i / n) * Math.PI * 18) * 0.35 + 0.65;
    data[i] = (Math.random() * 2 - 1) * env * chirp;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buf;
  const bp = audioCtx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(5200, t);
  bp.frequency.exponentialRampToValueAtTime(900, t + 0.09);
  bp.Q.value = 1.6;
  const ng = audioCtx.createGain();
  ng.gain.setValueAtTime(0.55, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  noise.connect(bp);
  bp.connect(ng);
  ng.connect(audioCtx.destination);
  noise.start(t);

  // Steel edge — sharp descending swoosh
  const osc = audioCtx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(2400, t);
  osc.frequency.exponentialRampToValueAtTime(220, t + 0.08);
  const hp = audioCtx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 700;
  const og = audioCtx.createGain();
  og.gain.setValueAtTime(0.12, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.085);
  osc.connect(hp);
  hp.connect(og);
  og.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.09);

  // Tip “cut” transient
  const click = audioCtx.createOscillator();
  click.type = "square";
  click.frequency.setValueAtTime(1800, t);
  click.frequency.exponentialRampToValueAtTime(400, t + 0.02);
  const cg = audioCtx.createGain();
  cg.gain.setValueAtTime(0.09, t);
  cg.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
  click.connect(cg);
  cg.connect(audioCtx.destination);
  click.start(t);
  click.stop(t + 0.03);
}

/**
 * Zoro three-sword cursor — default / hover / click sprites, green Haki trail,
 * click slash flash + synthetic slash SFX. Desktop fine-pointer only.
 */
export default function CustomCursor() {
  const canvasRef = useRef(null);
  const spriteRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;

    const canvas = canvasRef.current;
    const sprite = spriteRef.current;
    const root = rootRef.current;
    if (!canvas || !sprite || !root) return;

    const ctx = canvas.getContext("2d");
    let raf = 0;
    let audioCtx = null;

    const mouse = { x: -999, y: -999, visible: false };
    const prev = { x: -999, y: -999 };
    let hovering = false;
    let clicking = false;
    let clickUntil = 0;
    let slashAngle = 0;
    const particles = [];
    const sparks = []; // one-shot click debris
    let lastSpawn = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const ensureAudio = () => {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      return audioCtx;
    };

    const sprites = {
      default: swordsDefault,
      hover: swordsHover,
      click: swordsClick,
    };
    // Preload so click / hover swaps never flash blank
    Object.values(sprites).forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    let spriteMode = "default";
    let lastW = 40;
    let lastH = 40;
    sprite.src = sprites.default;

    const setSprite = () => {
      const next = clicking ? "click" : hovering ? "hover" : "default";
      if (next !== spriteMode) {
        spriteMode = next;
        sprite.src = sprites[next];
      }

      if (sprite.complete && sprite.naturalWidth) {
        // Prefer laid-out size; fall back to natural aspect at fixed width 40
        lastW = sprite.offsetWidth || 40;
        lastH = sprite.offsetHeight || lastW * (sprite.naturalHeight / sprite.naturalWidth);
      }
      const w = lastW;
      const h = lastH;
      const tipX = w * TIP.x;
      const tipY = h * TIP.y;
      const rot = clicking ? slashAngle : hovering ? -6 : 0;
      const scale = clicking ? 1.08 : hovering ? 1.04 : 1;

      // Keep the tip locked to the pointer even while the click art is up
      root.style.transform = `translate3d(${mouse.x - tipX}px, ${mouse.y - tipY}px, 0) rotate(${rot}deg) scale(${scale})`;
      root.style.opacity = mouse.visible ? "1" : "0";
    };

    const spawnTrail = (x, y, velocity) => {
      if (reduce) return;
      const count = hovering ? 3 : Math.max(1, Math.min(4, Math.floor(velocity / 6)));
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.25 + Math.random() * 0.9;
        particles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed * 0.4 - 0.3,
          vy: Math.sin(angle) * speed * 0.4 + 0.15,
          life: 1,
          decay: 0.018 + Math.random() * 0.02,
          size: hovering ? 2.5 + Math.random() * 3.5 : 1.6 + Math.random() * 2.4,
          hue: 110 + Math.random() * 40, // green Haki range
        });
      }
    };

    const spawnSlashBurst = (x, y) => {
      if (reduce) return;
      // Arc streak
      sparks.push({
        kind: "arc",
        x,
        y,
        life: 1,
        decay: 0.045,
        angle: -Math.PI / 3 + (Math.random() - 0.5) * 0.3,
      });
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI * 0.85 + Math.random() * Math.PI * 0.5;
        const sp = 2 + Math.random() * 4;
        sparks.push({
          kind: "shard",
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          decay: 0.03 + Math.random() * 0.025,
          size: 1.5 + Math.random() * 2.5,
        });
      }
    };

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.visible = true;
    };

    const onOver = (e) => {
      hovering = !!e.target.closest(INTERACTIVE);
    };

    const onDown = (e) => {
      // Don't let focus / drag quirks hide the cursor mid-click
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.visible = true;
      clicking = true;
      clickUntil = performance.now() + 180;
      slashAngle = -18 - Math.random() * 10;
      spawnSlashBurst(e.clientX, e.clientY);
      if (!reduce) playSlash(ensureAudio());
      setSprite();
    };

    const onUp = (e) => {
      if (typeof e?.clientX === "number") {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.visible = true;
      }
      // Keep click art until clickUntil; tick() clears the flag
      setSprite();
    };

    const onLeave = (e) => {
      // Only hide when the pointer actually leaves the window, not on
      // transient leave events from clicking into controls.
      if (e.relatedTarget == null) mouse.visible = false;
    };

    const tick = (now) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (clicking && now >= clickUntil) {
        clicking = false;
        slashAngle = 0;
      }

      const dx = mouse.x - prev.x;
      const dy = mouse.y - prev.y;
      const velocity = Math.hypot(dx, dy);

      if (mouse.visible && velocity > 1.2 && now - lastSpawn > 14) {
        spawnTrail(mouse.x, mouse.y, velocity);
        lastSpawn = now;
      }

      // Trail particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const a = p.life * 0.75;
        const r = p.size * p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 55%, ${a})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.8, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.8);
        g.addColorStop(0, `hsla(${p.hue}, 100%, 60%, ${a * 0.35})`);
        g.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // Click slash FX
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= s.decay;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        if (s.kind === "arc") {
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.angle);
          ctx.strokeStyle = `hsla(120, 100%, 55%, ${s.life * 0.85})`;
          ctx.lineWidth = 2.5 * s.life;
          ctx.lineCap = "round";
          ctx.shadowColor = "hsla(120, 100%, 50%, 0.8)";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(0, 0, 28 + (1 - s.life) * 18, -0.9, 0.55);
          ctx.stroke();
          ctx.restore();
        } else {
          s.x += s.vx;
          s.y += s.vy;
          s.vx *= 0.94;
          s.vy *= 0.94;
          ctx.fillStyle = `hsla(115, 95%, 58%, ${s.life})`;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + s.size * 2, s.y + s.size * 0.4);
          ctx.lineTo(s.x + s.size * 0.3, s.y + s.size * 1.6);
          ctx.closePath();
          ctx.fill();
        }
      }

      setSprite();
      prev.x = mouse.x;
      prev.y = mouse.y;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      if (audioCtx) audioCtx.close();
    };
  }, []);

  // Don't render custom cursor chrome on touch / coarse pointers
  if (typeof window !== "undefined") {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return null;
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[100000]"
      />
      <div
        ref={rootRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100001] will-change-transform"
        style={{ opacity: 0, transform: "translate3d(-999px,-999px,0)" }}
      >
        <img
          ref={spriteRef}
          src={swordsDefault}
          alt=""
          draggable={false}
          className="block select-none"
          style={{
            width: 40,
            height: "auto",
            filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.22))",
          }}
        />
      </div>
    </>
  );
}
