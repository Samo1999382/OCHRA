import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Film,
  Activity,
  CheckCircle2,
  AlertCircle,
  Menu,
} from "lucide-react";
import { Icon, Brand } from "./ui";
import { Contour } from "./MotionArt";
import ScrollStory from "./ScrollStory";
import LandingFooter from "./LandingFooter";
import { FeatureConstellation, AudiencePanels } from "./ScrollShowcase";
import {
  FindingsExplorer,
  WorkspacePreview,
  LandingFAQ,
} from "./LandingDetails";
export default function Landing() {
  const [menu, setMenu] = useState(false);
  const hero = useRef();
  const go = (e, id) => {
    e.preventDefault();
    document.getElementById(id).scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    setMenu(false);
  };
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame;
    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        hero.current?.style.setProperty(
          "--shift",
          `${Math.min(scrollY * 0.12, 90)}px`,
        );
        document.querySelectorAll(".intro,.clinician").forEach((el) => {
          const rect = el.getBoundingClientRect();
          const p = Math.max(
            0,
            Math.min(1, (innerHeight * 0.88 - rect.top) / (innerHeight * 0.6)),
          );
          el.style.setProperty("--reading", `${p * 100}%`);
          el.style.setProperty("--turn", `${p * 65}deg`);
        });
      });
    };
    window.addEventListener("scroll", scroll, { passive: true });
    scroll();
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal]").forEach((e) => {
      e.classList.add("reveal");
      observer.observe(e);
    });
    return () => {
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);
  return (
    <div className="landing">
      <header className="landing-nav">
        <Brand />
        <nav className={menu ? "expanded" : ""}>
          {[
            ["workflow", "Workflow"],
            ["research", "Research"],
            ["clinicians", "For clinicians"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={(e) => go(e, id)}>
              {label}
            </a>
          ))}
        </nav>
        <a className="button outline" href="#/overview">
          Open workspace <Icon icon={ArrowUpRight} />
        </a>
        <button
          className="mobile-menu icon-button"
          onClick={() => setMenu(!menu)}
          aria-label="Toggle navigation"
          aria-expanded={menu}
        >
          <Icon icon={Menu} />
        </button>
      </header>
      <main>
        <section className="hero" ref={hero}>
          <Contour />
          <div className="hero-copy">
            <h1>
              See the sequence.
              <br />
              Understand the skill.
            </h1>
            <p>
              AI-assisted surgical video review. Every step
              <br className="desktop-break" /> connected to the evidence behind
              it.
            </p>
            <div className="actions">
              <a className="button primary" href="#/case/OC-0248">
                Explore a sample <Icon icon={ArrowUpRight} />
              </a>
              <a
                className="text-link"
                href="#workflow"
                onClick={(e) => go(e, "workflow")}
              >
                Discover the workflow <Icon icon={ArrowRight} />
              </a>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <img src="/assets/hero-sequence.png" alt="" />
            <span className="art-label">Step 03 · Review segment</span>
          </div>
          <div className="hero-timeline">
            {[
              "Access",
              "Identification",
              "Dissection",
              "Division",
              "Closure",
            ].map((x, i) => (
              <div key={x} className={i === 2 ? "active" : ""}>
                <i />
                {x}
              </div>
            ))}
            <small>Illustrative procedure sequence</small>
          </div>
          <div className="hero-foot">
            <span>A procedure is more than its outcome.</span>
            <span>01 / The approach</span>
          </div>
        </section>
        <ScrollStory />
        <FeatureConstellation />
        <section id="workflow" className="section workflow" data-reveal>
          <div className="section-title">
            <div>
              <span className="eyebrow">From recording to understanding</span>
              <h2>
                One procedure.
                <br />A clearer perspective.
              </h2>
            </div>
            <p>
              A continuous path from operative video to a structured assessment,
              with the clinician in control.
            </p>
          </div>
          <div className="workflow-grid">
            {[
              [
                "01",
                "Bring in the recording",
                "Select the procedure and open your surgical video in a dedicated case workspace.",
                Film,
              ],
              [
                "02",
                "Trace every step",
                "Explore the expected sequence alongside proposed step boundaries and review points.",
                Activity,
              ],
              [
                "03",
                "Review the evidence",
                "Confirm or dismiss findings, record your rationale, and complete the review.",
                CheckCircle2,
              ],
            ].map(([n, title, text, icon]) => (
              <article key={n}>
                <span className="workflow-number">{n}</span>
                <Icon icon={icon} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <WorkspacePreview />
        <FindingsExplorer />
        <AudiencePanels />
        <LandingFAQ />
        <section className="section landing-cta" data-reveal>
          <span className="eyebrow">A closer look starts here</span>
          <h2>
            See the procedure.
            <br />
            Understand the performance.
          </h2>
          <a className="button primary" href="#/overview">
            Explore the workspace <Icon icon={ArrowUpRight} />
          </a>
          <p>Interactive demonstration · No live AI analysis</p>
        </section>
      </main>
      <LandingFooter onSection={go} />
    </div>
  );
}
