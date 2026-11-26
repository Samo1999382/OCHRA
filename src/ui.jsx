import React from "react";
import { ArrowUpRight, Film } from "lucide-react";
export const Icon = ({ icon: Comp, ...props }) => (
  <Comp size={18} strokeWidth={1.6} {...props} />
);
export const Brand = () => (
  <a className="brand" href="#/">
    OCHRA
  </a>
);
export function PageTitle({ eyebrow, title, text, children }) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {children}
    </div>
  );
}
export function Stat({ label, value, caption, icon }) {
  return (
    <article className="stat">
      <div>
        <span>{label}</span>
        <Icon icon={icon} />
      </div>
      <strong>{value}</strong>
      <small>{caption}</small>
    </article>
  );
}
export function CaseTable({ cases }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Procedure</th>
            <th>Surgeon</th>
            <th>Date</th>
            <th>Duration</th>
            <th>Score</th>
            <th>Status</th>
            <th>
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id}>
              <td>
                <a className="case-name" href={`#/case/${c.id}`}>
                  <span className="case-icon">
                    <Icon icon={Film} />
                  </span>
                  <span>
                    {c.name}
                    <small>{c.id}</small>
                  </span>
                </a>
              </td>
              <td>{c.surgeon}</td>
              <td>
                {new Date(`${c.date}T12:00:00`).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </td>
              <td>{c.duration}</td>
              <td>
                <span className="score-cell">{c.score ?? "—"}</span>
              </td>
              <td>
                <span
                  className={`status ${c.status === "Reviewed" ? "green" : "purple"}`}
                >
                  <i />
                  {c.status}
                </span>
              </td>
              <td>
                <a
                  className="icon-button"
                  href={`#/case/${c.id}`}
                  aria-label={`Review ${c.id}`}
                >
                  <Icon icon={ArrowUpRight} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!cases.length && (
        <div className="empty-inline">
          No matching cases. Try a different search or filter.
        </div>
      )}
    </div>
  );
}
export function TrendChart() {
  return (
    <div className="trend-chart">
      <div className="y-axis">
        <span>100</span>
        <span>80</span>
        <span>60</span>
      </div>
      <svg
        viewBox="0 0 700 180"
        role="img"
        aria-label="Illustrative scores increase from 72 to 89 across six months"
      >
        <defs>
          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#b698ff" stopOpacity=".22" />
            <stop offset="1" stopColor="#b698ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 80, 140].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="700"
            y2={y}
            stroke="#282832"
            strokeDasharray="4 5"
          />
        ))}
        <path
          d="M10 120 C65 120 80 75 140 85 S230 70 275 63 S360 95 410 65 S500 25 545 38 S640 55 690 29 L690 180 L10 180Z"
          fill="url(#chartFill)"
        />
        <path
          d="M10 120 C65 120 80 75 140 85 S230 70 275 63 S360 95 410 65 S500 25 545 38 S640 55 690 29"
          fill="none"
          stroke="#b99aff"
          strokeWidth="3"
        />
        {[
          [10, 120],
          [140, 85],
          [275, 63],
          [410, 65],
          [545, 38],
          [690, 29],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="4" fill="#cbb3ff" />
        ))}
      </svg>
      <div className="x-axis">
        {["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}
export function Empty({ title, text }) {
  return (
    <div className="empty-page">
      <h1>{title}</h1>
      <p>{text}</p>
      <a className="button primary" href="#/cases">
        View case library
      </a>
    </div>
  );
}
