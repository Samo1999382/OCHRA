import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  Film,
  ChartNoAxesCombined,
  Settings,
  Plus,
  ChevronRight,
  Menu,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { Icon, Brand, Empty } from "./ui";
import { initialCases } from "./data";
import Landing from "./Landing";
import { Overview, CaseLibrary, Analytics, SettingsPage } from "./Dashboards";
import "./styles.css";
import "./landing-story.css";
import "./scroll-showcase.css";
import "./footer.css";
const Review = lazy(() => import("./Review"));
const UploadModal = lazy(() => import("./UploadModal"));
function useRoute() {
  const [route, setRoute] = useState(location.hash.slice(1) || "/");
  useEffect(() => {
    const cb = () => {
      setRoute(location.hash.slice(1) || "/");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", cb);
    return () => window.removeEventListener("hashchange", cb);
  }, []);
  return route;
}
function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}
function App() {
  const route = useRoute();
  const [cases, setCases] = useStored("ochra-cases-v1", initialCases);
  const [reviews, setReviews] = useStored("ochra-reviews-v1", {});
  const [settings, setSettings] = useStored("ochra-settings-v1", {
    name: "Dr. Maya Hassan",
    role: "Clinical reviewer",
  });
  const [upload, setUpload] = useState(false);
  const [localVideos, setLocalVideos] = useState({});
  const [toast, setToast] = useState("");
  const toastTimer = useRef();
  const videosRef = useRef(localVideos);
  videosRef.current = localVideos;
  useEffect(
    () => () => {
      Object.values(videosRef.current).forEach(URL.revokeObjectURL);
      clearTimeout(toastTimer.current);
    },
    [],
  );
  const closeUpload = useCallback(() => setUpload(false), []);
  function notify(text) {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4000);
  }
  function addCase(file, procedure, surgeon) {
    const id = `OC-${Date.now().toString().slice(-6)}`;
    const url = URL.createObjectURL(file);
    setLocalVideos((v) => ({ ...v, [id]: url }));
    setCases((c) => [
      {
        id,
        name: procedure,
        surgeon,
        date: new Date().toISOString().slice(0, 10),
        duration: "Local video",
        status: "Ready for manual review",
        score: null,
      },
      ...c,
    ]);
    setUpload(false);
    location.hash = `/case/${id}`;
    notify("Video opened locally. Ready for manual review.");
  }
  function complete(id) {
    setCases((c) =>
      c.map((x) => (x.id === id ? { ...x, status: "Reviewed" } : x)),
    );
    notify("Review saved in this browser.");
  }
  const props = {
    route,
    cases,
    reviews,
    setReviews,
    complete,
    localVideos,
    notify,
    onUpload: () => setUpload(true),
    settings,
    setSettings,
  };
  return (
    <>
      {route === "/" ? (
        <Landing />
      ) : (
        <Shell route={route} onUpload={props.onUpload} settings={settings}>
          <Suspense fallback={<p>Loading workspace…</p>}>
            <Workspace {...props} />
          </Suspense>
        </Shell>
      )}
      {upload && (
        <Suspense fallback={null}>
          <UploadModal close={closeUpload} onSubmit={addCase} />
        </Suspense>
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon icon={CheckCircle2} />
          {toast}
        </div>
      )}
    </>
  );
}
const navItems = [
  ["/overview", "Overview", LayoutDashboard],
  ["/cases", "Case library", Film],
  ["/analytics", "Performance", ChartNoAxesCombined],
  ["/settings", "Settings", Settings],
];
function Shell({ route, onUpload, settings, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Brand />
        <div className="workspace-label">
          <span className="workspace-avatar">O</span>
          <div>
            Clinical workspace<small>Demonstration</small>
          </div>
        </div>
        <nav>
          {navItems.map(([path, label, icon]) => (
            <a
              key={path}
              href={`#${path}`}
              onClick={() => setOpen(false)}
              className={
                route === path ||
                (path === "/cases" && route.startsWith("/case/"))
                  ? "selected"
                  : ""
              }
            >
              <Icon icon={icon} />
              {label}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-box">
            <span className="dot" /> Demo environment
            <p>
              Explore sample cases or review a local video. AI analysis is not
              connected.
            </p>
          </div>
          <a className="back-site" href="#/">
            <Icon icon={LogOut} />
            Back to website
          </a>
          <div className="profile">
            <span>MH</span>
            <div>
              {settings.name}
              <small>{settings.role} · Demo</small>
            </div>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="app-main">
        <header className="app-header">
          <button
            className="icon-button mobile-menu"
            onClick={() => setOpen(!open)}
            aria-label="Toggle sidebar"
            aria-expanded={open}
          >
            <Icon icon={Menu} />
          </button>
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} />
            <span>
              {route.startsWith("/case/")
                ? "Case review"
                : navItems.find((x) => x[0] === route)?.[1] || "Page"}
            </span>
          </div>
          <div className="header-right">
            <span className="demo-pill">Demo data</span>
            <button className="button primary small" onClick={onUpload}>
              <Icon icon={Plus} />
              New case
            </button>
          </div>
        </header>
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
function Workspace(props) {
  const { route, cases } = props;
  if (route === "/overview") return <Overview {...props} />;
  if (route === "/cases") return <CaseLibrary {...props} />;
  if (route === "/analytics") return <Analytics {...props} />;
  if (route === "/settings") return <SettingsPage {...props} />;
  if (route.startsWith("/case/")) {
    const c = cases.find((c) => c.id === route.split("/")[2]);
    return c ? (
      <Review key={c.id} item={c} {...props} />
    ) : (
      <Empty
        title="Case not found"
        text="Return to the case library to choose an available case."
      />
    );
  }
  return (
    <Empty
      title="Page not found"
      text="Choose a page from the workspace navigation."
    />
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
