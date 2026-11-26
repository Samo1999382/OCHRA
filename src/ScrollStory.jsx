import React, { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";

const clamp = (v) => Math.max(0, Math.min(1, v));
const range = (p, a, b) => clamp((p - a) / (b - a));
// Zero velocity and acceleration at both ends of each scene transition.
const ease = (v) => v * v * v * (v * (v * 6 - 15) + 10);
const story =
  "Every operation tells a story. OCHRA brings the sequence, timing, and technique into focus — connecting each observation to its moment in the video. So an experienced clinician can see the context, review the evidence, and understand the performance.";

function Sculpture({ kind }) {
  return (
    <svg viewBox="0 0 160 100" fill="none" aria-hidden="true">
      {Array.from({ length: 15 }, (_, i) =>
        kind === "ring" ? (
          <ellipse
            key={i}
            cx="80"
            cy="50"
            rx={32 + i * 0.55}
            ry={32 - i * 0.2}
            transform={`rotate(${i * 4} 80 50)`}
          />
        ) : kind === "coil" ? (
          <ellipse
            key={i}
            cx="80"
            cy={32 + i * 2.5}
            rx="35"
            ry="12"
            transform="rotate(-16 80 50)"
          />
        ) : (
          <ellipse
            key={i}
            cx="80"
            cy="50"
            rx={40 - i * 1.65}
            ry={8 + i * 1.9}
            transform={`rotate(${i * 12} 80 50)`}
          />
        ),
      )}
    </svg>
  );
}
function Waves({ className }) {
  return (
    <svg
      className={`story-waves ${className}`}
      viewBox="0 0 600 600"
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: 28 }, (_, i) => (
        <path
          key={i}
          d={`M${70 + i * 17} -100 C${-70 + i * 17} 130 ${420 + i * 9} 120 ${200 + i * 15} 320 S${120 + i * 15} 480 ${240 + i * 13} 700`}
          strokeWidth="5"
        />
      ))}
    </svg>
  );
}

export default function ScrollStory() {
  const root = useRef();
  const stage = useRef();
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const section = root.current;
    const panel = stage.current;
    const words = [...panel.querySelectorAll(".story-copy span")];
    let raf = null;
    let current = 0;
    let target = 0;
    let lastTime = 0;
    let width = panel.clientWidth;
    let height = panel.clientHeight;
    const paint = (p) => {
      const enter = ease(range(p, 0.05, 0.34));
      const exit = ease(range(p, 0.42, 0.66));
      const read = range(p, 0.64, 0.96);
      panel.style.setProperty("--capsule", enter);
      panel.style.setProperty("--fade", 1 - exit);
      panel.style.setProperty("--dim", 1 - ease(range(p, 0.27, 0.44)) * 0.62);
      panel.style.setProperty("--exit-y", `${exit * -42}px`);
      panel.style.setProperty("--subject-x", `${exit * width * 0.1}px`);
      panel.style.setProperty("--subject-y", `${exit * height * 0.09}px`);
      panel.style.setProperty("--subject-scale", 1 - exit * 0.15);
      panel.style.setProperty("--copy-opacity", ease(range(p, 0.55, 0.67)));
      panel.style.setProperty("--spin", `${p * 75}deg`);
      panel.style.setProperty("--wave-shift", `${(p - 0.5) * 36}px`);
      panel.style.setProperty("--progress", `${p * 100}%`);
      panel.dataset.phase =
        p < 0.34 ? "assemble" : p < 0.64 ? "transition" : "read";
      words.forEach((word, i) => {
        word.style.opacity =
          0.32 +
          ease(
            range(
              read,
              Math.max(0, (i - 2) / words.length),
              (i + 1) / words.length,
            ),
          ) *
            0.68;
      });
    };
    // Frame-rate-independent damping filters wheel/touch jumps without
    // intercepting native scrolling. The loop stops as soon as it settles.
    const tick = (time) => {
      const dt = Math.min(64, Math.max(0, time - lastTime));
      lastTime = time;
      current += (target - current) * (1 - Math.exp(-dt / 110));
      if (Math.abs(target - current) < 0.0001) {
        current = target;
        raf = null;
        panel.dataset.motion = "settled";
      } else {
        raf = requestAnimationFrame(tick);
      }
      paint(current);
    };
    const update = () => {
      const rect = section.getBoundingClientRect();
      width = panel.clientWidth;
      height = panel.clientHeight;
      target = motion.matches
        ? 1
        : clamp(
            -rect.top / Math.max(1, section.offsetHeight - panel.offsetHeight),
          );
      if (motion.matches || rect.bottom <= 0 || rect.top >= innerHeight) {
        cancelAnimationFrame(raf);
        raf = null;
        current = target;
        panel.dataset.motion = "settled";
        paint(current);
      } else if (raf === null) {
        panel.dataset.motion = "moving";
        lastTime = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    motion.addEventListener("change", update);
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      motion.removeEventListener("change", update);
    };
  }, []);
  return (
    <section
      className="scroll-story"
      ref={root}
      aria-label="Observe every step. Understand the procedure."
    >
      <div className="story-stage" ref={stage}>
        <Waves className="waves-top" />
        <Waves className="waves-bottom" />
        <div className="story-chrome">
          <span>OCHRA / A closer perspective</span>
          <span>
            Scroll to unfold <ArrowDown size={13} />
          </span>
        </div>
        <div className="story-composition" aria-hidden="true">
          <div className="story-row story-row-one">
            <span>Observe</span>
            <span className="story-capsule capsule-one">
              <Sculpture kind="ring" />
            </span>
            <span>Every</span>
          </div>
          <div className="story-row story-row-two">
            <span>Step</span>
            <span className="story-capsule capsule-two">
              <Sculpture kind="coil" />
            </span>
            <em>Understand</em>
          </div>
          <span className="story-prefix">The</span>
          <div className="story-subject">
            <span className="story-capsule capsule-three">
              <Sculpture kind="orbit" />
            </span>
            <span>Procedure.</span>
          </div>
        </div>
        <p className="story-copy">
          {story.split(" ").map((word, i) => (
            <span key={i}>{word} </span>
          ))}
        </p>
        <div className="story-bottom">
          <span>From a recording to a reviewable story.</span>
          <span>01 — The approach</span>
        </div>
        <div className="story-progress" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  );
}
