import React, { useEffect, useRef, useState } from "react";
import { X, Upload, ArrowRight } from "lucide-react";
import { Icon } from "./ui";
export default function UploadModal({ close, onSubmit }) {
  const [file, setFile] = useState(null);
  const [procedure, setProcedure] = useState("Laparoscopic appendectomy");
  const [surgeon, setSurgeon] = useState("Dr. Maya Hassan");
  const [error, setError] = useState("");
  const ref = useRef();
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const cb = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const focusable = ref.current.querySelectorAll("button,input,select");
        const first = focusable[0],
          last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", cb);
    return () => {
      document.removeEventListener("keydown", cb);
      prev?.focus();
    };
  }, [close]);
  function choose(f) {
    if (
      f &&
      !f.type.startsWith("video/") &&
      !/\.(mp4|webm|mov)$/i.test(f.name)
    ) {
      setError("Choose a video file: MP4, WebM, or MOV.");
      return;
    }
    setFile(f);
    setError("");
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-title"
        ref={ref}
        tabIndex={-1}
      >
        <button
          className="modal-close icon-button"
          aria-label="Close dialog"
          onClick={close}
        >
          <Icon icon={X} />
        </button>
        <span className="eyebrow">Create a case</span>
        <h2 id="upload-title">Start with the recording.</h2>
        <p>
          Open a video for manual review. The file stays on your device and is
          not uploaded to a server.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!file) {
              setError("Select a video to continue.");
              return;
            }
            onSubmit(file, procedure, surgeon);
          }}
        >
          <label
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              choose(e.dataTransfer.files[0]);
            }}
          >
            <Icon icon={Upload} />
            <strong>{file ? file.name : "Drop a video here, or browse"}</strong>
            <span>
              {file
                ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                : "MP4, WebM or MOV · Browser playback support varies"}
            </span>
            <input
              aria-label="Select video"
              type="file"
              accept="video/*,.mp4,.webm,.mov"
              onChange={(e) => choose(e.target.files[0])}
            />
          </label>
          <label>
            Procedure
            <select
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
            >
              <option>Laparoscopic appendectomy</option>
              <option>Laparoscopic cholecystectomy</option>
              <option>Other procedure</option>
            </select>
          </label>
          <label>
            Surgeon
            <input
              required
              value={surgeon}
              onChange={(e) => setSurgeon(e.target.value)}
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button type="button" className="button outline" onClick={close}>
              Cancel
            </button>
            <button className="button primary" type="submit">
              Open case <Icon icon={ArrowRight} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
