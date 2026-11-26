import React, { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Clock,
  ListOrdered,
  SkipForward,
  Play,
  Plus,
} from "lucide-react";
import { Icon } from "./ui";

const findings = [
  {
    name: "Sequence",
    icon: ListOrdered,
    label: "A different order. A moment to review.",
    text: "Compare the observed sequence with the expected workflow. Open the neighboring moments to understand why the order changed.",
    expected: ["01", "02", "03", "04", "05"],
    observed: ["01", "02", "04", "03", "05"],
    flagged: [2, 3],
    note: "Steps 03 and 04 appear in a different order.",
  },
  {
    name: "Omission",
    icon: SkipForward,
    label: "A missing step deserves a closer look.",
    text: "A step that is not observed may be omitted, obscured, or outside the recording. Check the evidence before confirming an omission.",
    expected: ["01", "02", "03", "04", "05"],
    observed: ["01", "02", "—", "04", "05"],
    flagged: [2],
    note: "Step 03 was not observed in this illustrative sequence.",
  },
  {
    name: "Timing",
    icon: Clock,
    label: "Duration is a signal. Context matters.",
    text: "Compare the duration of a step with its reference window, then consider case complexity and operative circumstances.",
    expected: ["5s", "8s", "5s", "12s", "7s"],
    observed: ["5s", "8s", "7s", "12s", "7s"],
    flagged: [2],
    note: "Example: a 5-second reference step takes 7 seconds.",
  },
];

export function FindingsExplorer() {
  const [active, setActive] = useState(0);
  const finding = findings[active];
  return (
    <section className="section findings-explorer" id="research" data-reveal>
      <div className="section-title">
        <div>
          <span className="eyebrow">The detail behind the score</span>
          <h2>
            Different deviations.
            <br />
            One place to understand them.
          </h2>
        </div>
        <p>
          An observation starts a review. The video and the clinician's judgment
          give it meaning.
        </p>
      </div>
      <div
        className="finding-tabs"
        role="tablist"
        aria-label="Types of procedural findings"
      >
        {findings.map((item, i) => (
          <button
            key={item.name}
            id={`finding-tab-${i}`}
            role="tab"
            aria-selected={active === i}
            aria-controls="finding-demo"
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const next =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? 2
                      : (active + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                setActive(next);
                document.getElementById(`finding-tab-${next}`).focus();
              }
            }}
          >
            <Icon icon={item.icon} />
            {item.name}
            <span>0{i + 1}</span>
          </button>
        ))}
      </div>
      <div
        className="finding-demo"
        id="finding-demo"
        role="tabpanel"
        aria-labelledby={`finding-tab-${active}`}
      >
        <div className="finding-description">
          <span className="badge">Illustrative example</span>
          <h3>{finding.label}</h3>
          <p>{finding.text}</p>
          <a className="text-link" href="#/case/OC-0248">
            Review the evidence <Icon icon={ArrowUpRight} />
          </a>
        </div>
        <div className="alignment-demo">
          <label>Expected</label>
          <div>
            {finding.expected.map((item, i) => (
              <span key={i}>{item}</span>
            ))}
          </div>
          <label>Observed</label>
          <div>
            {finding.observed.map((item, i) => (
              <span
                key={i}
                className={
                  finding.flagged.includes(i)
                    ? `flag ${active === 1 ? "missing" : ""}`
                    : ""
                }
              >
                {item}
              </span>
            ))}
          </div>
          <p>
            <Icon icon={finding.icon} />
            {finding.note}
          </p>
          <small>
            A workflow deviation does not, by itself, establish an unsuccessful
            outcome.
          </small>
        </div>
      </div>
    </section>
  );
}

export function WorkspacePreview() {
  const [selected, setSelected] = useState(2);
  const labels = [
    "Access & exposure",
    "Identify appendix",
    "Mesoappendix dissection",
    "Appendiceal base",
    "Extraction & closure",
  ];
  const times = ["00:00", "04:12", "12:06", "25:17", "34:21"];
  return (
    <section className="section product-preview" data-reveal>
      <div className="section-title">
        <div>
          <span className="eyebrow">A workspace built for the review</span>
          <h2>
            The moment.
            <br />
            The finding. The full picture.
          </h2>
        </div>
        <a className="button outline" href="#/overview">
          Explore workspace <Icon icon={ArrowUpRight} />
        </a>
      </div>
      <div className="preview-window">
        <div className="preview-title">
          <span>
            <i />
            <i />
            <i />
          </span>
          <p>OCHRA / Case review</p>
          <span className="badge">Interactive sample</span>
        </div>
        <div className="preview-body">
          <div className="preview-film">
            <img
              src="/assets/hero-sequence.png"
              alt="Illustrative surgical video sequence"
              loading="lazy"
            />
            <div className="preview-film-label">
              <span>{times[selected]} / 42:18</span>
              <h3>{labels[selected]}</h3>
              <a href="#/case/OC-0248" aria-label="Open sample review">
                <Play size={19} />
                Open review
              </a>
            </div>
            <div className="preview-track">
              {labels.map((label, i) => (
                <button
                  key={label}
                  onClick={() => setSelected(i)}
                  aria-label={`Preview ${label}`}
                  aria-pressed={selected === i}
                  className={selected === i ? "selected" : ""}
                />
              ))}
            </div>
          </div>
          <div className="preview-steps">
            <div>
              <span>Procedure map</span>
              <small>5 example steps</small>
            </div>
            {labels.map((label, i) => (
              <button
                key={label}
                className={selected === i ? "selected" : ""}
                aria-pressed={selected === i}
                onClick={() => setSelected(i)}
              >
                <span>0{i + 1}</span>
                <div>
                  {label}
                  <small>{times[i]}</small>
                </div>
                <ArrowUpRight size={14} />
              </button>
            ))}
            <p>
              <Icon icon={Check} />
              Every finding stays connected to its evidence.
            </p>
          </div>
        </div>
      </div>
      <div className="preview-benefits">
        <div>
          <span>01</span>
          <h3>Find the relevant moment</h3>
          <p>Move from a step to its position in the recording.</p>
        </div>
        <div>
          <span>02</span>
          <h3>Keep your reasoning</h3>
          <p>Save notes alongside confirmed or dismissed findings.</p>
        </div>
        <div>
          <span>03</span>
          <h3>Bring the review together</h3>
          <p>Complete the case and export a structured record.</p>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  [
    "Does a deviation mean the operation failed?",
    "No. A difference in sequence, timing, or an unobserved step is a point for review. Its significance depends on the procedure, case context, and expert assessment.",
  ],
  [
    "Who confirms the assessment?",
    "The clinician reviews the evidence, records their reasoning, and confirms or dismisses each proposed finding before completing the assessment.",
  ],
  [
    "Can I try it with my own video?",
    "You can open a local video in the workspace for manual review. It plays in your browser and is not sent to a server. Local video access ends when the session closes.",
  ],
  [
    "Is the AI analysis live?",
    "This version demonstrates the interface with illustrative cases and scores. Model inference and validated scoring rules are not yet connected. New videos do not receive an automated assessment.",
  ],
  [
    "What can I export?",
    "The workspace exports a JSON record containing case details, review decisions, and reviewer notes. Demonstration data is clearly identified in the export.",
  ],
];
export function LandingFAQ() {
  return (
    <section className="section landing-faq" data-reveal>
      <div>
        <span className="eyebrow">Before you explore</span>
        <h2>
          A little more
          <br />
          clarity.
        </h2>
        <a href="#/case/OC-0248" className="text-link">
          Try a sample case <Icon icon={ArrowRight} />
        </a>
      </div>
      <div className="faq-list">
        {faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <Plus size={18} />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
