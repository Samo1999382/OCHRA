import React, { useRef } from "react";
import {
  Film,
  ListOrdered,
  Clock,
  CheckCircle2,
  Activity,
  FileText,
  ArrowUpRight,
  ScanLine,
} from "lucide-react";
import { Icon } from "./ui";
import { Wireform } from "./MotionArt";
import usePinnedScene, { segment, smooth } from "./usePinnedScene";

const floatingCards = [
  {
    kind: "score",
    start: 0.03,
    end: 0.68,
    className: "float-score",
    label: "Example score",
  },
  {
    icon: Film,
    title: "The recording. The full context.",
    text: "Keep the operative video at the heart of every assessment.",
    start: 0.09,
    end: 0.81,
    className: "float-recording",
  },
  {
    icon: ListOrdered,
    title: "A procedure, mapped step by step.",
    text: "Follow the sequence and return to the moments that matter.",
    start: 0.18,
    end: 0.9,
    className: "float-sequence",
  },
  {
    icon: Clock,
    title: "Every variation has a context.",
    text: "Examine timing and sequence before deciding what a difference means.",
    start: 0.28,
    end: 1.02,
    className: "float-timing",
  },
  {
    kind: "symbol",
    start: 0.23,
    end: 0.88,
    className: "float-symbol",
    label: "Evidence linked",
  },
  {
    icon: CheckCircle2,
    title: "Your expertise. The final call.",
    text: "Confirm, dismiss, or annotate each observation with your reasoning.",
    start: 0.4,
    end: 1.08,
    className: "float-expert",
  },
  {
    kind: "visual",
    start: 0.34,
    end: 0.97,
    className: "float-visual",
    label: "Source recording",
  },
  {
    icon: FileText,
    title: "A review you can return to.",
    text: "Bring notes and decisions together in a structured case record.",
    start: 0.49,
    end: 1.13,
    className: "float-record",
  },
];

function setupConstellation(stage) {
  const cards = [...stage.querySelectorAll(".floating-feature")];
  const heading = stage.querySelector(".constellation-heading");
  return ({ progress, height, reduced }) => {
    heading.style.setProperty(
      "--heading-rise",
      `${(1 - smooth(segment(progress, 0, 0.15))) * 95}px`,
    );
    heading.style.setProperty(
      "--heading-opacity",
      0.5 + smooth(segment(progress, 0, 0.15)) * 0.5,
    );
    cards.forEach((card, i) => {
      const { start, end } = floatingCards[i];
      const travel = segment(progress, start, end);
      const cardHeight = card.offsetHeight;
      // Each card follows its own vertical lane and speed. The title stays put.
      const y = height + 45 - travel * (height + cardHeight + 110);
      card.style.transform = reduced ? "none" : `translate3d(0,${y}px,0)`;
    });
  };
}

export function FeatureConstellation() {
  const root = useRef();
  const stage = useRef();
  usePinnedScene(root, stage, setupConstellation);
  return (
    <section
      className="feature-constellation"
      ref={root}
      aria-labelledby="constellation-title"
    >
      <div className="constellation-stage" ref={stage}>
        <div className="scene-topline">
          <span>02 / See the whole picture</span>
          <span>One connected review experience</span>
        </div>
        <div className="constellation-heading">
          <span className="eyebrow">Clarity at every stage</span>
          <h2 id="constellation-title">
            Understand the
            <br />
            <em>performance.</em>
          </h2>
        </div>
        <div className="constellation-cards">
          {floatingCards.map((card, i) => (
            <article key={i} className={`floating-feature ${card.className}`}>
              {card.kind === "score" ? (
                <>
                  <div className="orbit-score">
                    <span>
                      82<small>/100</small>
                    </span>
                    <CheckCircle2 size={17} />
                  </div>
                  <p>Illustrative score</p>
                </>
              ) : card.kind === "symbol" ? (
                <>
                  <ScanLine size={30} strokeWidth={1} />
                  <span>Evidence linked</span>
                </>
              ) : card.kind === "visual" ? (
                <>
                  <img
                    src="/assets/hero-sequence.png"
                    alt="Illustrative surgical sequence"
                    loading="lazy"
                  />
                  <span>Source recording</span>
                </>
              ) : (
                <>
                  <span className="feature-icon">
                    <Icon icon={card.icon} />
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <div className="feature-wire" aria-hidden="true">
                    <Wireform />
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
        <div className="scene-bottomline">
          <span>Scroll to connect the details</span>
          <a href="#/overview">
            Explore OCHRA <Icon icon={ArrowUpRight} />
          </a>
        </div>
        <div className="scene-rail" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  );
}

const audiences = [
  {
    key: "surgeons",
    label: "For surgeons",
    title: (
      <>
        See your technique.
        <br />
        Shape your progress.
      </>
    ),
    text: "Revisit the sequence behind a procedure. Bring relevant moments and review notes together to support reflection and discussion.",
    action: "View case library",
    href: "#/cases",
    view: "Case library",
    icon: Film,
  },
  {
    key: "reviewers",
    label: "For clinical reviewers",
    title: (
      <>
        Your perspective.
        <br />
        Connected to the evidence.
      </>
    ),
    text: "Move from a proposed finding to the recording, add clinical context, and make a considered assessment of each step.",
    action: "Try a case review",
    href: "#/case/OC-0248",
    view: "Case review",
    icon: CheckCircle2,
  },
  {
    key: "researchers",
    label: "For research teams",
    title: (
      <>
        Step-level detail.
        <br />A broader perspective.
      </>
    ),
    text: "Explore case-level patterns, compare illustrative assessments, and keep the underlying evidence within reach.",
    action: "Explore performance",
    href: "#/analytics",
    view: "Performance",
    icon: Activity,
  },
];

function MiniWorkspace({ type }) {
  return (
    <div className={`audience-mockup mockup-${type}`} aria-hidden="true">
      <div className="mockup-bar">
        <span>OCHRA</span>
        <span>Clinical workspace</span>
        <i />
      </div>
      <div className="mockup-content">
        <div className="mockup-sidebar">
          <Activity />
          <Film />
          <ListOrdered />
          <FileText />
        </div>
        <div className="mockup-main">
          {type === "surgeons" ? (
            <>
              <span className="mockup-eyebrow">Your procedure library</span>
              <h4>A closer look at every case.</h4>
              <div className="mockup-stats">
                <div>
                  <small>Sample cases</small>
                  <strong>05</strong>
                </div>
                <div>
                  <small>Reviewed</small>
                  <strong>03</strong>
                </div>
              </div>
              {[
                "Laparoscopic appendectomy",
                "Laparoscopic cholecystectomy",
                "Laparoscopic appendectomy",
              ].map((label, i) => (
                <div className="mockup-case" key={i}>
                  <Film size={15} />
                  <span>
                    {label}
                    <small>OC-024{8 - i}</small>
                  </span>
                  <i>{i === 1 ? "Reviewed" : "To review"}</i>
                </div>
              ))}
            </>
          ) : type === "reviewers" ? (
            <>
              <span className="mockup-eyebrow">OC-0248 / Sample review</span>
              <h4>Every finding. In context.</h4>
              <div className="mockup-video">
                <img src="/assets/hero-sequence.png" alt="" loading="lazy" />
                <span>12:06 / Mesoappendix dissection</span>
              </div>
              <div className="mockup-timebars">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="mockup-note">
                <Clock size={15} />
                <div>
                  Timing variation
                  <small>Review the segment before confirming.</small>
                </div>
              </div>
              <div className="mockup-actions">
                <span>Confirm finding</span>
                <span>Add context</span>
              </div>
            </>
          ) : (
            <>
              <span className="mockup-eyebrow">Illustrative performance</span>
              <h4>A perspective on progress.</h4>
              <div className="mockup-stats">
                <div>
                  <small>Mean score</small>
                  <strong>
                    89<small>/100</small>
                  </strong>
                </div>
                <div>
                  <small>Sample cases</small>
                  <strong>05</strong>
                </div>
              </div>
              <div className="mockup-chart">
                <svg viewBox="0 0 380 125" fill="none">
                  <path
                    d="M0 100H380M0 60H380M0 20H380"
                    stroke="#3a2c45"
                    strokeDasharray="3 6"
                  />
                  <path
                    d="M5 104 C48 100 55 47 102 65 S160 30 204 45 S280 14 320 29 S355 26 375 10"
                    stroke="#c89dfb"
                    strokeWidth="3"
                  />
                </svg>
                <span>Case-by-case assessment</span>
              </div>
              <div className="mockup-note">
                <ListOrdered size={15} />
                <div>
                  Sequence · timing · context
                  <small>Keep the evidence behind the numbers.</small>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function setupAudience(stage) {
  const cards = [...stage.querySelectorAll(".audience-card")];
  const dots = [...stage.querySelectorAll(".audience-dot")];
  return ({ progress, height, reduced }) => {
    // 19–21s reference: peel the front card upward to uncover a slightly
    // smaller card underneath. Keep a reading pause between each peel.
    const lifts = [
      smooth(segment(progress, 0.18, 0.44)),
      smooth(segment(progress, 0.6, 0.86)),
    ];
    const active = lifts.filter((lift) => lift > 0.6).length;
    stage.dataset.active = String(active);
    cards.forEach((card, i) => {
      const revealed = i === 0 ? 1 : lifts[i - 1];
      const leaving = lifts[i] || 0;
      const y = (1 - revealed) * height * 0.055 - leaving * height * 1.02;
      card.style.setProperty("--card-y", `${y}px`);
      card.style.setProperty("--card-scale", 0.93 + revealed * 0.07);
      card.style.setProperty("--card-opacity", 1);
      card.inert = !reduced && i !== active;
      if (!reduced && i !== active) card.setAttribute("aria-hidden", "true");
      else card.removeAttribute("aria-hidden");
    });
    dots.forEach((dot, i) => {
      dot.dataset.active = String(i === active);
      if (i === active) dot.setAttribute("aria-current", "step");
      else dot.removeAttribute("aria-current");
    });
  };
}

export function AudiencePanels() {
  const root = useRef();
  const stage = useRef();
  usePinnedScene(root, stage, setupAudience);
  function jump(index) {
    const section = root.current,
      panel = stage.current;
    const progress = 0.08 + (index / (audiences.length - 1)) * 0.86;
    const top = section.getBoundingClientRect().top + scrollY;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches)
      panel
        .querySelectorAll(".audience-card")
        [index].scrollIntoView({ behavior: "auto", block: "center" });
    else
      window.scrollTo({
        top: top + (section.offsetHeight - panel.offsetHeight) * progress,
        behavior: "smooth",
      });
  }
  return (
    <section
      className="audience-panels"
      id="clinicians"
      ref={root}
      aria-label="OCHRA for surgeons, clinical reviewers and research teams"
    >
      <div className="audience-stage" ref={stage}>
        <div className="scene-topline">
          <span>Built around your perspective</span>
          <span>One workspace. Different ways to see.</span>
        </div>
        <div className="audience-viewport">
          {audiences.map((audience, i) => (
            <article
              className={`audience-card audience-${audience.key}`}
              key={audience.key}
              style={{ zIndex: audiences.length - i }}
            >
              <div className="audience-copy">
                <span className="audience-label">
                  <Icon icon={audience.icon} />
                  {audience.label}
                </span>
                <h2>{audience.title}</h2>
                <p>{audience.text}</p>
                <a className="button audience-cta" href={audience.href}>
                  {audience.action}
                  <Icon icon={ArrowUpRight} />
                </a>
                <small>Interactive demonstration</small>
              </div>
              <MiniWorkspace type={audience.key} />
              <div className="audience-rings" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </article>
          ))}
        </div>
        <div className="audience-pagination" aria-label="Choose a perspective">
          {audiences.map((audience, i) => (
            <button
              className="audience-dot"
              key={audience.key}
              onClick={() => jump(i)}
            >
              <span>0{i + 1}</span>
              {audience.label}
            </button>
          ))}
        </div>
        <div className="scene-rail" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  );
}
