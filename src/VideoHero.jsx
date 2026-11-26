import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import "./video-hero.css";

export default function VideoHero({ onWorkflow }) {
  const video = useRef(null);
  const [paused, setPaused] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const player = video.current;
    let visible = true;
    let active = true;
    const sync = () => {
      if (paused || !visible || document.hidden) player.pause();
      else {
        player.play().catch(() => {
          if (active && visible && !document.hidden) setPaused(true);
        });
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(player);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      active = false;
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      player.pause();
    };
  }, [paused]);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setPaused(preference.matches);
    preference.addEventListener("change", change);
    return () => preference.removeEventListener("change", change);
  }, []);
  return (
    <section className="cinema-hero" aria-label="Surgical video intelligence">
      <div className="cinema-media">
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="metadata"
          poster="/assets/hero-poster.png"
          onError={() => setFailed(true)}
          aria-label="AI-generated surgical training scene: gloved hands gently manipulate a translucent practice membrane"
        >
          <source src="/assets/hero-surgical.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="cinema-copy">
        <span className="cinema-kicker">Surgical video intelligence</span>
        <h1>
          Understand
          <br />
          the skill behind
          <br />
          every step.
        </h1>
        <p>
          See the sequence, timing, and technique.
          <br />
          Keep every observation connected
          <br className="cinema-desktop" /> to its evidence.
        </p>
        <div className="cinema-actions">
          <a className="button primary" href="#/case/OC-0248">
            Explore a sample <ArrowUpRight size={17} />
          </a>
          <a className="cinema-workflow" href="#workflow" onClick={onWorkflow}>
            How it works
          </a>
        </div>
      </div>
      <aside className="procedure-map" aria-label="Illustrative procedure map">
        <h2>Procedure map</h2>
        <ol>
          {[
            "Access",
            "Identification",
            "Dissection",
            "Division",
            "Closure",
          ].map((step, index) => (
            <li key={step} className={index === 2 ? "current" : ""}>
              <span className="map-node" />
              <span>0{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <p>Illustrative analysis.</p>
      </aside>
      <div className="cinema-step">
        Step 03 · Dissection<span>Illustrative training sequence</span>
      </div>
      {!failed && (
        <button
          className="cinema-pause"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
        >
          {paused ? "Play motion" : "Pause motion"}{" "}
          <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
        </button>
      )}
      <div className="cinema-footer">
        <a href="#workflow" onClick={onWorkflow}>
          Scroll to follow the procedure <ArrowDown size={15} />
        </a>
        <span>
          Video <span>→</span> Steps <span>→</span> Expert review
        </span>
      </div>
    </section>
  );
}
