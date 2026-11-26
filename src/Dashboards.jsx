import React, { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Upload,
  Film,
  Clock,
  CheckCircle2,
  Activity,
  Search,
  Plus,
  ChartNoAxesCombined,
  AlertCircle,
  Check,
} from "lucide-react";
import { PageTitle, Stat, Icon, CaseTable, TrendChart } from "./ui";
export function Overview({ cases, onUpload, settings }) {
  const reviewed = cases.filter((c) => c.status === "Reviewed");
  const scored = reviewed.filter((c) => c.score != null);
  return (
    <>
      <PageTitle
        eyebrow="Your workspace, at a glance"
        title={`Welcome back, ${settings.name}`}
        text="A closer look at your procedures and the moments that matter."
      >
        <button className="button outline small" onClick={onUpload}>
          <Icon icon={Upload} />
          Open a video
        </button>
      </PageTitle>
      <div className="stats-grid">
        <Stat
          label="Total cases"
          value={cases.length.toString().padStart(2, "0")}
          caption="In this demonstration workspace"
          icon={Film}
        />
        <Stat
          label="Awaiting review"
          value={cases
            .filter((c) => c.status !== "Reviewed")
            .length.toString()
            .padStart(2, "0")}
          caption="Ready for your perspective"
          icon={Clock}
        />
        <Stat
          label="Reviewed cases"
          value={reviewed.length.toString().padStart(2, "0")}
          caption="Review marked complete"
          icon={CheckCircle2}
        />
        <Stat
          label="Mean reviewed score"
          value={
            scored.length
              ? Math.round(
                  scored.reduce((s, c) => s + c.score, 0) / scored.length,
                )
              : "—"
          }
          caption="Illustrative scores · out of 100"
          icon={Activity}
        />
      </div>
      <div className="overview-grid">
        <section className="panel trend-panel">
          <div className="panel-title">
            <div>
              <h2>Performance over time</h2>
              <p>Illustrative case scores</p>
            </div>
            <a href="#/analytics">
              View report <Icon icon={ArrowUpRight} />
            </a>
          </div>
          <TrendChart />
          <div className="chart-legend">
            <span className="dot" />
            Workflow score<span>Example data, not clinical benchmarking</span>
          </div>
        </section>
        <section className="panel focus-panel">
          <span className="eyebrow">Your next review</span>
          <h2>
            Every finding deserves
            <br />a closer look.
          </h2>
          <div className="focus-orbit">
            <Activity size={58} strokeWidth={0.8} />
          </div>
          <p>
            {cases.filter((c) => c.status !== "Reviewed").length} cases are
            waiting for review. Start with the latest procedure.
          </p>
          <a
            className="button primary"
            href={`#/case/${cases.find((c) => c.status !== "Reviewed")?.id || cases[0]?.id}`}
          >
            Open case <Icon icon={ArrowRight} />
          </a>
        </section>
      </div>
      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>Recent procedures</h2>
            <p>Your latest case activity</p>
          </div>
          <a href="#/cases">
            View all cases <Icon icon={ArrowRight} />
          </a>
        </div>
        <CaseTable cases={cases.slice(0, 4)} />
      </section>
    </>
  );
}
export function CaseLibrary({ cases, onUpload }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All cases");
  const filtered = cases.filter(
    (c) =>
      (filter === "All cases" ||
        (filter === "Needs review"
          ? c.status !== "Reviewed"
          : c.status === "Reviewed")) &&
      `${c.name} ${c.id} ${c.surgeon}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="Procedure library"
        title="Every case. One place."
        text="Find recordings, continue reviews, and revisit the evidence."
      />
      <section className="panel">
        <div className="library-toolbar">
          <div className="tabs">
            {["All cases", "Needs review", "Reviewed"].map((x) => (
              <button
                key={x}
                className={filter === x ? "active" : ""}
                onClick={() => setFilter(x)}
              >
                {x}
              </button>
            ))}
          </div>
          <label className="search">
            <Icon icon={Search} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cases or surgeons"
              aria-label="Search cases"
            />
          </label>
        </div>
        <CaseTable cases={filtered} />
        <div className="table-footer">
          Showing {filtered.length} of {cases.length} cases{" "}
          <button className="text-link" onClick={onUpload}>
            <Icon icon={Plus} />
            Add a case
          </button>
        </div>
      </section>
    </>
  );
}
export function Analytics({ cases }) {
  const [surgeon, setSurgeon] = useState("All surgeons");
  const filtered = cases.filter(
    (c) =>
      c.score != null && (surgeon === "All surgeons" || c.surgeon === surgeon),
  );
  const average = filtered.length
    ? Math.round(filtered.reduce((s, c) => s + c.score, 0) / filtered.length)
    : 0;
  return (
    <>
      <PageTitle
        eyebrow="Performance insights"
        title="A perspective on progress."
        text="Explore illustrative assessment patterns across the case library."
      >
        <select
          aria-label="Filter by surgeon"
          value={surgeon}
          onChange={(e) => setSurgeon(e.target.value)}
        >
          <option>All surgeons</option>
          {[...new Set(cases.map((c) => c.surgeon))].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </PageTitle>
      <div className="stats-grid three">
        <Stat
          label="Cases with a score"
          value={filtered.length}
          caption="Illustrative assessments"
          icon={Film}
        />
        <Stat
          label="Mean workflow score"
          value={average || "—"}
          caption="Out of 100 · Example rubric"
          icon={Activity}
        />
        <Stat
          label="Highest case score"
          value={
            filtered.length ? Math.max(...filtered.map((c) => c.score)) : "—"
          }
          caption="Within the selected cases"
          icon={ChartNoAxesCombined}
        />
      </div>
      <div className="analytics-grid">
        <section className="panel">
          <div className="panel-title">
            <div>
              <h2>Case score comparison</h2>
              <p>Filtered cases · illustrative scores</p>
            </div>
          </div>
          <div className="bar-chart">
            {filtered.map((c) => (
              <a href={`#/case/${c.id}`} key={c.id}>
                <span>{c.id}</span>
                <div>
                  <i style={{ width: `${c.score}%` }} />
                </div>
                <strong>{c.score}</strong>
              </a>
            ))}
            {!filtered.length && <p>No scored cases for this surgeon.</p>}
          </div>
        </section>
        <section className="panel insight-panel">
          <span className="eyebrow">Reading the assessment</span>
          <h2>Context comes first.</h2>
          <p>
            Score differences can reflect case complexity, procedural variation,
            and reviewer interpretation. Compare the evidence alongside the
            number.
          </p>
          <div>
            <Icon icon={Activity} />
            <span>Sequence and technique</span>
          </div>
          <div>
            <Icon icon={Clock} />
            <span>Timing in case context</span>
          </div>
          <div>
            <Icon icon={CheckCircle2} />
            <span>Expert-reviewed observations</span>
          </div>
        </section>
      </div>
      <section className="panel">
        <div className="panel-title">
          <h2>Assessment details</h2>
          <span className="badge">Demo dataset</span>
        </div>
        <CaseTable cases={filtered} />
      </section>
    </>
  );
}
export function SettingsPage({ notify, settings, setSettings }) {
  const [draft, setDraft] = useState(settings);
  return (
    <>
      <PageTitle
        eyebrow="Workspace preferences"
        title="Make room for your workflow."
        text="Manage your local demonstration profile and preferences."
      />
      <form
        className="panel settings-panel"
        onSubmit={(e) => {
          e.preventDefault();
          setSettings(draft);
          notify("Preferences saved in this browser.");
        }}
      >
        <h2>Reviewer profile</h2>
        <p>These details are stored on this device only.</p>
        <label>
          Display name
          <input
            required
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <label>
          Role
          <select
            value={draft.role}
            onChange={(e) => setDraft({ ...draft, role: e.target.value })}
          >
            <option>Clinical reviewer</option>
            <option>Surgeon</option>
            <option>Researcher</option>
          </select>
        </label>
        <div className="settings-info">
          <Icon icon={AlertCircle} />
          <p>
            This workspace demonstrates the review experience. Account
            authentication, server storage, and AI inference are not connected.
          </p>
        </div>
        <button className="button primary" type="submit">
          Save preferences <Icon icon={Check} />
        </button>
      </form>
    </>
  );
}
