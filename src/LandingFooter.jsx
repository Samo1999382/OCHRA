import React from "react";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import { Icon } from "./ui";

export default function LandingFooter({ onSection }) {
  return (
    <footer className="signature-footer">
      <div className="footer-aura" aria-hidden="true" />
      <div className="signature-top">
        <div className="signature-intro">
          <span>Surgical intelligence. Human perspective.</span>
          <a className="signature-headline" href="#/case/OC-0248">
            See every step clearly.
            <ArrowUpRight strokeWidth={1} />
          </a>
          <nav aria-label="Footer navigation">
            <a href="#workflow" onClick={(e) => onSection(e, "workflow")}>
              How it works
            </a>
            <a href="#clinicians" onClick={(e) => onSection(e, "clinicians")}>
              Who it's for
            </a>
            <a href="#research" onClick={(e) => onSection(e, "research")}>
              The approach
            </a>
            <a
              href="https://github.com/Samo1999382/OCHRA"
              target="_blank"
              rel="noreferrer"
            >
              Explore the project
            </a>
          </nav>
        </div>
        <div className="signature-invite">
          <h2>A closer perspective.</h2>
          <p>
            Explore the steps behind
            <br />
            every procedure.
          </p>
          <a className="button footer-white-button" href="#/overview">
            Open workspace
            <Icon icon={ArrowUpRight} />
          </a>
        </div>
      </div>
      <nav className="signature-destinations" aria-label="Explore OCHRA">
        {[
          ["Case library", "/cases"],
          ["Review a case", "/case/OC-0248"],
          ["Performance", "/analytics"],
          ["Your workspace", "/overview"],
        ].map(([label, path]) => (
          <a key={path} href={`#${path}`}>
            {label}
            <Icon icon={ArrowUpRight} />
          </a>
        ))}
      </nav>
      <a
        className="signature-wordmark"
        href="#/"
        aria-label="OCHRA — back to top"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
          });
        }}
      >
        {"OCHRA".split("").map((letter) => (
          <span key={letter} aria-hidden="true">
            {letter}
          </span>
        ))}
      </a>
      <div className="signature-bottom">
        <span>
          © {new Date().getFullYear()} OCHRA. Surgical video intelligence.
        </span>
        <div>
          <span>Interactive demonstration</span>
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "auto"
                  : "smooth",
              })
            }
          >
            Back to top
            <Icon icon={ArrowUp} />
          </button>
        </div>
      </div>
    </footer>
  );
}
