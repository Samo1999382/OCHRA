import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Download,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Check,
} from "lucide-react";
import { Icon, PageTitle } from "./ui";
import { getProcedureSteps } from "./data";
export default function Review({
  item,
  reviews,
  setReviews,
  complete,
  localVideos,
  notify,
  onUpload,
}) {
  const steps = React.useMemo(
    () => getProcedureSteps(item),
    [item.name, item.duration],
  );
  const totalSeconds =
    item.score != null
      ? item.duration.split(":").reduce((n, p) => n * 60 + Number(p), 0)
      : 2538;
  const [active, setActive] = useState(2);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(steps[2].start);
  const [videoError, setVideoError] = useState(false);
  const video = useRef();
  const actual = localVideos[item.id];
  const isSample = item.score != null;
  const review = reviews[item.id] || { notes: "", decisions: {} };
  const [notes, setNotes] = useState(review.notes);
  useEffect(() => {
    if (actual || !playing) return;
    const t = setInterval(
      () => setProgress((p) => (p >= totalSeconds ? 0 : p + 1)),
      1000,
    );
    return () => clearInterval(t);
  }, [playing, actual, totalSeconds]);
  useEffect(() => {
    if (isSample) setActive(steps.findLastIndex((s) => s.start <= progress));
  }, [progress, isSample, steps]);
  function select(i) {
    setActive(i);
    setProgress(steps[i].start);
    if (video.current)
      video.current.currentTime = Math.min(
        steps[i].start,
        video.current.duration || 0,
      );
  }
  function decide(decision) {
    setReviews((r) => ({
      ...r,
      [item.id]: {
        ...review,
        notes,
        decisions: { ...review.decisions, [active]: decision },
      },
    }));
    notify(`Finding ${decision.toLowerCase()}.`);
  }
  function save() {
    setReviews((r) => ({ ...r, [item.id]: { ...review, notes } }));
    notify("Review notes saved.");
  }
  function exportReview() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            case: item,
            review: { ...review, notes },
            disclaimer:
              "Demonstration data; not a validated clinical assessment.",
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.id}-review.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const formatTime = (n) =>
    `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
  return (
    <>
      <a className="back-link" href="#/cases">
        <Icon icon={ChevronLeft} />
        Back to case library
      </a>
      <PageTitle
        eyebrow={`${item.id} / ${item.surgeon}`}
        title={item.name}
        text={`${item.date} · ${item.duration} · ${isSample ? "Illustrative case" : "Local video — manual review"}`}
      >
        <button className="button outline small" onClick={exportReview}>
          <Icon icon={Download} />
          Export review
        </button>
      </PageTitle>
      <div className="review-layout">
        <div>
          <section className="panel video-panel">
            <div className="panel-title">
              <h2>Operative recording</h2>
              <span className="badge">
                {actual ? "Local video" : "Illustrative preview"}
              </span>
            </div>
            {actual ? (
              <>
                <video
                  ref={video}
                  src={actual}
                  controls
                  onError={() => setVideoError(true)}
                  onTimeUpdate={(e) => setProgress(e.target.currentTime)}
                  className="actual-video"
                />
                {videoError && (
                  <p className="error">
                    This browser cannot play this video format. Try an MP4
                    encoded with H.264.
                  </p>
                )}
              </>
            ) : (
              <div className="sample-player">
                <img
                  src="/assets/hero-sequence.png"
                  alt="Illustrative surgical video sequence"
                />
                <div className="sample-overlay">
                  <span className="badge">
                    {isSample ? "Sample visualization" : "Local file needed"}
                  </span>
                  <strong>
                    {isSample
                      ? steps[active].name
                      : "Video unavailable after reload"}
                  </strong>
                  <p>
                    {isSample
                      ? "No patient recording is included."
                      : "Local video files aren't stored. Reopen the recording below."}
                  </p>
                  {!isSample && (
                    <button className="button outline small" onClick={onUpload}>
                      Open a recording
                    </button>
                  )}
                </div>
              </div>
            )}
            {!actual && isSample && (
              <div className="video-controls">
                <button
                  className="icon-button"
                  onClick={() => setPlaying(!playing)}
                  aria-label={
                    playing ? "Pause sample timeline" : "Play sample timeline"
                  }
                >
                  <Icon icon={playing ? Pause : Play} />
                </button>
                <span>{formatTime(progress)}</span>
                <input
                  type="range"
                  min="0"
                  max={totalSeconds}
                  value={progress}
                  aria-label="Sample timeline position"
                  onChange={(e) => setProgress(Number(e.target.value))}
                />
                <span>{item.duration}</span>
              </div>
            )}
            {isSample && (
              <div className="review-timeline">
                {steps.map((s, i) => (
                  <button
                    key={s.name}
                    className={active === i ? "active" : ""}
                    onClick={() => select(i)}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </section>
          <section className="panel notes-panel">
            <div className="panel-title">
              <h2>Reviewer notes</h2>
              <span className="tiny">Saved locally</span>
            </div>
            <label className="sr-only" htmlFor="review-notes">
              Clinical review notes
            </label>
            <textarea
              id="review-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context, observations, or a rationale for your decisions…"
            />
            <div className="notes-footer">
              <span className="tiny">Use demonstration information only.</span>
              <button className="button outline small" onClick={save}>
                Save notes
              </button>
            </div>
          </section>
        </div>
        <aside className="review-aside">
          <section className="panel score-panel">
            <div>
              <span className="eyebrow">
                {item.status === "Reviewed"
                  ? "Reviewed example"
                  : "Provisional assessment"}
              </span>
              <span className="score-value">
                {item.score ?? "—"}
                <small>{item.score != null ? "/ 100" : ""}</small>
              </span>
            </div>
            <p>
              {isSample
                ? "Illustrative workflow score. Clinical scoring rules are not connected."
                : "No AI analysis available. Add your observations in reviewer notes."}
            </p>
            <span
              className={`status ${item.status === "Reviewed" ? "green" : "purple"}`}
            >
              <i />
              {item.status}
            </span>
          </section>
          {isSample && (
            <>
              <section className="panel step-panel">
                <div className="panel-title">
                  <h2>Procedure steps</h2>
                  <span className="tiny">5 identified</span>
                </div>
                {steps.map((s, i) => (
                  <button
                    className={`review-step ${i === active ? "active" : ""}`}
                    key={s.name}
                    onClick={() => select(i)}
                  >
                    <span className="step-no">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <strong>{s.name}</strong>
                      <small>
                        {s.time} · {s.duration}
                      </small>
                    </span>
                    <Icon
                      icon={i === 2 || i === 3 ? AlertCircle : CheckCircle2}
                    />
                  </button>
                ))}
              </section>
              <section className="panel finding-panel">
                <div className="panel-title">
                  <h2>{steps[active].status}</h2>
                  <Icon icon={AlertCircle} />
                </div>
                <p>{steps[active].note}</p>
                <span className="tiny">
                  Example suggestion · Expert confirmation required
                </span>
                {review.decisions[active] ? (
                  <div className="decision-saved">
                    <Icon icon={Check} /> {review.decisions[active]}
                    <button
                      onClick={() => {
                        const decisions = { ...review.decisions };
                        delete decisions[active];
                        setReviews((r) => ({
                          ...r,
                          [item.id]: { ...review, notes, decisions },
                        }));
                      }}
                    >
                      Undo
                    </button>
                  </div>
                ) : (
                  <div className="finding-actions">
                    <button
                      className="button primary small"
                      onClick={() => decide("Confirmed")}
                    >
                      Confirm
                    </button>
                    <button
                      className="button outline small"
                      onClick={() => decide("Dismissed")}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </section>
            </>
          )}
          <button
            className="button primary full"
            disabled={item.status === "Reviewed"}
            onClick={() => {
              setReviews((r) => ({ ...r, [item.id]: { ...review, notes } }));
              complete(item.id);
            }}
          >
            <Icon icon={CheckCircle2} />
            {item.status === "Reviewed"
              ? "Review completed"
              : "Complete review"}
          </button>
        </aside>
      </div>
    </>
  );
}
